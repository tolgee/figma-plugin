import { useApiQuery } from "@/ui/client/useQueryApi";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { NamespaceSelect } from "@/ui/components/NamespaceSelect/NamespaceSelect";
import { BranchSelect } from "@/ui/components/BranchSelect/BranchSelect";
import { TolgeeConfig } from "@/types";
import { VerticalSpace, Text, Muted } from "@create-figma-plugin/ui";
import { h, Fragment, FunctionComponent } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import styles from "./ProjectSettings.css";
import { InfoTooltip } from "../../components/InfoTooltip/InfoTooltip";
import { useHasNamespacesEnabled } from "../../hooks/useHasNamespacesEnabled";
import { useHasBranchingEnabled } from "../../hooks/useHasBranchingEnabled";
import { getProjectIdFromApiKey } from "../../client/decodeApiKey";
import { Branch } from "../../icons/SvgIcons";

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

const branchingHelpTextSetUp = ({
  apiUrl,
  projectId,
}: {
  apiUrl: string;
  projectId: number;
}) => (
  <Fragment>
    <div>
      Branching is disabled in Platform.
      <br />
      Enable it{" "}
      <a
        href={`${apiUrl}/projects/${projectId}/manage/edit/advanced`}
        target="_blank"
        rel="noreferrer"
      >
        here
      </a>{" "}
      to use branches.
    </div>
  </Fragment>
);

const branchingHelpText = () => (
  <Fragment>
    <div>
      This project uses branching. <br />
      Upload keys only to permitted branches. <br />
      <a
        href="https://docs.tolgee.io/platform/branching/overview"
        target="_blank"
        rel="noreferrer"
      >
        Read more about branching
      </a>
      .
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
    undefined,
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
  const hasBranchingEnabled = useHasBranchingEnabled();

  const apiKeyInfo = useApiQuery({
    url: "/v2/api-keys/current",
    method: "get",
    options: {
      enabled: hasBranchingEnabled,
      cacheTime: 60000,
      staleTime: 60000,
    },
    clientOptions: {
      config: {
        apiKey,
        apiUrl,
      },
    },
  });

  const branchesLoadable = useApiQuery({
    url: "/v2/projects/{projectId}/branches",
    method: "get",
    path: {
      projectId: apiKeyInfo.data?.projectId ?? 0,
    },
    options: {
      cacheTime: 0,
      staleTime: 0,
      enabled: hasBranchingEnabled && apiKeyInfo.data?.projectId !== undefined,
    },
    clientOptions: {
      config: {
        apiKey,
        apiUrl,
      },
    },
  });

  const branches = useMemo(
    () => branchesLoadable.data?._embedded?.branches ?? [],
    [branchesLoadable.data],
  );

  const languages = languagesLoadable.data?._embedded?.languages;
  const namespaces = useMemo(() => {
    const ns = namespacesLoadable.data?._embedded?.namespaces?.map(
      (n) => n.name || "",
    ) ?? [""];

    if (ns.length === 0) {
      ns.push("");
    }

    if (settings?.namespace !== undefined && !ns.includes(settings.namespace)) {
      ns.push(settings.namespace);
    }

    // Sort namespaces: keep empty string (implicit default) first, then alphabetically
    ns.sort((a, b) => {
      if (a === "" || !a) return -1;
      if (b === "" || !b) return 1;
      return a.localeCompare(b);
    });

    return ns;
  }, [namespacesLoadable.data, settings?.namespace]);

  const branchNames = useMemo(() => branches.map((b) => b.name), [branches]);

  useEffect(() => {
    if (!namespacesLoadable.data || !languagesLoadable.data || settings) {
      return;
    }
    if (hasBranchingEnabled && branchesLoadable.isLoading) {
      return;
    }

    const defaultBranch = branches.find((b) => b.isDefault)?.name;
    const savedBranch =
      initialData?.branch && branchNames.includes(initialData.branch)
        ? initialData.branch
        : undefined;

    setSettings({
      language:
        initialData?.language || languages?.find((l) => l.base)?.tag || "",
      namespace: initialData?.namespace ?? namespaces?.[0] ?? "",
      branch: hasBranchingEnabled ? (savedBranch ?? defaultBranch) : undefined,
    });
  }, [
    branchNames,
    branches,
    branchesLoadable.isLoading,
    hasBranchingEnabled,
    languages,
    namespaces,
    settings,
  ]);

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
      {!hasNamespacesEnabled && (
        <Fragment>
          <div className={styles.namespaceShowRow}>
            <Muted>Namespaces are disabled</Muted>
            <InfoTooltip>
              {namespaceHelpTextSetUp({
                apiUrl,
                projectId: getProjectIdFromApiKey(apiKey) ?? 0,
              })}
            </InfoTooltip>
          </div>
          <VerticalSpace space="small" />
        </Fragment>
      )}
      {hasNamespacesEnabled && (
        <Fragment>
          <VerticalSpace space="extraSmall" />
          <div className={styles.namespaceShowRow}>
            <Text>
              <Muted>Default namespace</Muted>
            </Text>
            <InfoTooltip>
              {namespaceHelpText({
                apiUrl,
                projectId: getProjectIdFromApiKey(apiKey) ?? 0,
              })}
            </InfoTooltip>
          </div>
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
      {!hasBranchingEnabled && (
        <Fragment>
          <VerticalSpace space="small" />
          <div className={styles.branchingShowRow}>
            <Text>
              <Muted>Branching is disabled</Muted>
            </Text>
            <InfoTooltip>
              {branchingHelpTextSetUp({
                apiUrl,
                projectId: getProjectIdFromApiKey(apiKey) ?? 0,
              })}
            </InfoTooltip>
          </div>
          <VerticalSpace space="small" />
        </Fragment>
      )}
      {hasBranchingEnabled && (
        <Fragment>
          <VerticalSpace space="extraSmall" />
          <div className={styles.branchingShowRow}>
            <Branch width={12} height={12} />
            <Text>
              <Muted>Branch</Muted>
            </Text>
            <InfoTooltip>{branchingHelpText()}</InfoTooltip>
          </div>
          <VerticalSpace space="extraSmall" />
          <div className={styles.branchingRow}>
            <BranchSelect
              key={settings?.branch || ""}
              value={settings?.branch || ""}
              branches={branches}
              onChange={(branch) =>
                setSettings((settings) => ({
                  ...settings!,
                  branch,
                }))
              }
              onRefresh={async () => {
                await branchesLoadable.refetch();
              }}
            />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};
