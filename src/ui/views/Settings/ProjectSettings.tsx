import { useApiQuery } from "@/ui/client/useQueryApi";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { NamespaceSelect } from "@/ui/components/NamespaceSelect/NamespaceSelect";
import { TolgeeConfig } from "@/types";
import { VerticalSpace, Text, Muted, Checkbox } from "@create-figma-plugin/ui";
import { Fragment, FunctionComponent, h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import styles from "./ProjectSettings.css";
import { InfoTooltip } from "../../components/InfoTooltip/InfoTooltip";
import { useHasNamespacesEnabled } from "../../hooks/useHasNamespacesEnabled";
import { getProjectIdFromApiKey } from "../../client/decodeApiKey";

type Props = {
  apiKey: string;
  apiUrl: string;
  initialData?: Partial<TolgeeConfig>;
  onChange: (data: Partial<TolgeeConfig>) => void;
};

const namespaceHelpText = ({
  apiUrl,
  projectId,
}: {
  apiUrl: string;
  projectId: number;
}) => (
  <Fragment>
    <div>
      Namespaces are enabled in Platform.
      <br />
      Disable them{" "}
      <a
        href={`${apiUrl}/projects/${projectId}/manage/edit/advanced`}
        target="_blank"
        rel="noreferrer"
      >
        here
      </a>{" "}
      to no longer user namespaces.
      <br />
      For more information about namespaces,
      <br />
      check the{" "}
      <a
        href="https://docs.tolgee.io/js-sdk/namespaces"
        target="_blank"
        rel="noreferrer"
      >
        docs of the platform
      </a>
      .
    </div>
  </Fragment>
);
const namespaceHelpTextSetUp = ({
  apiUrl,
  projectId,
}: {
  apiUrl: string;
  projectId: number;
}) => (
  <Fragment>
    <div>
      Namespaces are disabled in Platform.
      <br />
      Enable them{" "}
      <a
        href={`${apiUrl}/projects/${projectId}/manage/edit/advanced`}
        target="_blank"
        rel="noreferrer"
      >
        here
      </a>{" "}
      to use namespaces.
    </div>
  </Fragment>
);

export const ProjectSettings: FunctionComponent<Props> = ({
  apiKey,
  apiUrl,
  onChange,
  initialData,
}) => {
  const [settings, setSettings] = useState<Partial<TolgeeConfig> | undefined>(
    undefined
  );

  const languagesLoadable = useApiQuery({
    url: "/v2/projects/languages",
    method: "get",
    query: {
      size: 1000,
    },
    options: {
      cacheTime: 0,
      staleTime: 0,
    },
    clientOptions: {
      config: {
        apiKey,
        apiUrl,
      },
    },
  });

  const namespacesLoadable = useApiQuery({
    url: "/v2/projects/used-namespaces",
    method: "get",
    options: {
      cacheTime: 0,
      staleTime: 0,
    },
    clientOptions: {
      config: {
        apiKey,
        apiUrl,
      },
    },
  });

  const hasNamespacesEnabled = useHasNamespacesEnabled();

  const languages = languagesLoadable.data?._embedded?.languages;
  const namespaces = useMemo(() => {
    const ns = namespacesLoadable.data?._embedded?.namespaces?.map(
      (n) => n.name || ""
    ) ?? [""];

    if (ns.length === 0) {
      ns.push("");
    }

    if (
      settings?.namespace !== undefined &&
      !ns.includes(settings.namespace)
    ) {
      ns.push(settings.namespace);
    }

    // Sort namespaces alphabetically
    ns.sort((a, b) => {
      // Sort alphabetically, but put empty string at the end
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });

    return ns;
  }, [namespacesLoadable.data, settings?.namespace]);

  useEffect(() => {
    if (!settings && namespacesLoadable.data && languagesLoadable.data) {
      setSettings({
        language:
          initialData?.language || languages?.find((l) => l.base)?.tag || "",
        namespace: initialData?.namespace ?? namespaces?.[0] ?? "",
      });
    }
  }, [languages, namespaces]);

  useEffect(() => {
    if (settings) {
      onChange(settings);
    }
  }, [settings]);

  if (languagesLoadable.isLoading || namespacesLoadable.isLoading) {
    return <FullPageLoading />;
  }

  return (
    <Fragment>
      <VerticalSpace space="medium" />
      <Text>
        <Muted>Current language</Muted>
      </Text>
      <VerticalSpace space="small" />
      <select
        data-cy="settings_input_language"
        value={settings?.language}
        onChange={(e) =>
          setSettings((settings) => ({
            ...settings!,
            language: e.currentTarget.value || "",
          }))
        }
      >
        {languages?.map((language) => (
          <option key={language.id} value={language.tag}>
            {language.name}
          </option>
        ))}
      </select>
      <VerticalSpace space="medium" />
      <div className={styles.namespaceShowRow}>
        <Checkbox disabled value={hasNamespacesEnabled}>
          <Text>Use namespaces</Text>
        </Checkbox>

        {hasNamespacesEnabled ? (
          <InfoTooltip>
            {namespaceHelpText({
              apiUrl,
              projectId: getProjectIdFromApiKey(apiKey) ?? 0,
            })}
          </InfoTooltip>
        ) : (
          <InfoTooltip>
            {namespaceHelpTextSetUp({
              apiUrl,
              projectId: getProjectIdFromApiKey(apiKey) ?? 0,
            })}
          </InfoTooltip>
        )}
      </div>
      <VerticalSpace space="small" />
      {hasNamespacesEnabled && (
        <Fragment>
          <VerticalSpace space="extraSmall" />
          <Text>
            <Muted>Default namespace</Muted>
          </Text>
          <VerticalSpace space="small" />
          <div className={styles.namespacesRow}>
            <NamespaceSelect
              key={settings?.namespace || ""}
              value={settings?.namespace || ""}
              namespaces={namespaces}
              onChange={(namespace) =>
                setSettings((settings) => ({
                  ...settings!,
                  namespace,
                }))
              }
            />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};
