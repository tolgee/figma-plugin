import { getProjectIdFromApiKey } from "./decodeApiKey";
import { paths } from "./apiSchema.generated";
import { RequestParamsType, ResponseContent } from "./types";
import { globalState } from "../state/GlobalState";
import { errorToText } from "./errorCodes";

type GlobalOptions = {
  apiUrl?: string;
  apiKey?: string;
};

export type ClientOptions =
  | {
      config: GlobalOptions;
    }
  | undefined;

type Params = {
  [k: string]: string | string[] | null | undefined | Params;
};

async function getResObject(r: Response) {
  const textBody = await r.text();
  try {
    return JSON.parse(textBody);
  } catch (e) {
    return textBody;
  }
}

const flattenParams = (
  params: Params | null | undefined
): Record<string, string | string[]> => {
  if (params) {
    return Object.entries(params).reduce(
      (acc, [key, value]) =>
        Array.isArray(value) || typeof value !== "object"
          ? { ...acc, [key]: value }
          : { ...acc, ...flattenParams(value) },
      {}
    );
  }
  return {};
};

function buildQuery(object: { [key: string]: any }): string {
  return Object.keys(object)
    .filter((k) => !!object[k])
    .map((k) => {
      if (Array.isArray(object[k])) {
        return object[k]
          .map((v: any) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&");
      }
      return `${encodeURIComponent(k)}=${encodeURIComponent(object[k])}`;
    })
    .join("&");
}

async function customFetch(
  input: RequestInfo,
  options: GlobalOptions,
  init?: RequestInit
): Promise<Response> {
  if (!options.apiUrl) {
    throw "URL not specified";
  }
  if (!options.apiKey) {
    throw "API key not specified";
  }

  init = init || {};
  init.headers = init.headers || {};
  init.headers = {
    "X-API-Key": options.apiKey,
    "X-Tolgee-SDK-Type": "Figma",
    ...init.headers,
  };

  return fetch(options.apiUrl + input, init)
    .then(async (r) => {
      if (!r.ok) {
        const data = await getResObject(r);
        const message = errorToText(data?.message || data?.error || data?.code);

        if (r.status === 403 && message === "Forbidden") {
          globalState.actions.setGlobalError("Invalid API key");
        }

        throw new Error(message);
      }
      return await getResObject(r);
    })
    .catch((e) => {
      if (!e.message || e.message === "Failed to fetch") {
        const message = "Could not connect to server";
        globalState.actions.setGlobalError(message);
        throw message;
      } else {
        throw e.message;
      }
    });
}

export const addProjectIdToUrl = (url: string) => {
  return url.replace("/projects/", "/projects/{projectId}/");
};

export async function client<
  Url extends keyof Paths,
  Method extends keyof Paths[Url],
  Paths = paths
>(
  url: Url,
  method: Method,
  request: RequestParamsType<Url, Method, Paths>,
  clientOptions: ClientOptions,
  options: GlobalOptions
) {
  const fetchOptions = { ...options, ...clientOptions?.config };
  const pathParams = (request as any)?.path || {};
  let urlResult = url as string;

  const projectId = getProjectIdFromApiKey(fetchOptions.apiKey);
  if (projectId !== undefined) {
    pathParams.projectId = projectId;
    urlResult = addProjectIdToUrl(urlResult);
  }

  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      urlResult = urlResult.replace(`{${key}}`, value as any);
    });
  }

  const formData = request?.content?.["multipart/form-data"] as Record<
    string,
    unknown
  >;
  let body: FormData | undefined;
  if (formData) {
    body = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        let fileName: undefined | string;
        if (Object.prototype.toString.call(value) === "[object File]") {
          fileName = (value as any as File).name;
        }

        value.forEach((item) => body?.append(key, item as any, fileName));
        return;
      }
      body?.append(key, value as any);
    });
  }

  const jsonBody = JSON.stringify(request?.content?.["application/json"]);

  const queryParams = request?.query as any;
  let queryString = "";

  const params = flattenParams(queryParams);
  const query = buildQuery(params);
  if (query) {
    queryString = `?${query}`;
  }

  const defaultHeaders = jsonBody
    ? {
        "Content-Type": "application/json",
      }
    : {};

  return customFetch(urlResult + queryString, fetchOptions, {
    method: method as string,
    body: body || jsonBody,
    headers: defaultHeaders as HeadersInit,
  }) as Promise<ResponseContent<Url, Method, Paths>>;
}
