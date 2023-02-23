import { useApiQuery } from "@/client/useQueryApi";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";
import { NamespaceSelect } from "@/components/NamespaceSelect/NamespaceSelect";
import { TolgeeConfig } from "@/types";
import { VerticalSpace, Text, Muted, Checkbox } from "@create-figma-plugin/ui";
import { Fragment, FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import styles from "./ProjectSettings.css";

type Props = {
  apiKey: string;
  apiUrl: string;
  initialData?: Partial<TolgeeConfig>;
  onChange: (data: Partial<TolgeeConfig>) => void;
};

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

  const languages = languagesLoadable.data?._embedded?.languages;
  const namespaces = namespacesLoadable.data?._embedded?.namespaces?.map(
    (n) => n.name || ""
  ) || [""];
  const namespacesNotPresent = namespaces?.length === 1 && !namespaces[0];

  useEffect(() => {
    if (!settings && namespacesLoadable.data && languagesLoadable.data) {
      setSettings({
        language:
          initialData?.language || languages?.find((l) => l.base)?.tag || "",
        namespace: initialData?.namespace ?? namespaces?.[0] ?? "",
        namespacesDisabled:
          initialData?.namespacesDisabled ?? namespacesNotPresent,
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
      <Text>
        <Muted>Default namespace</Muted>
      </Text>
      <VerticalSpace space="small" />
      <div className={styles.namespacesRow}>
        <NamespaceSelect
          value={settings?.namespace || ""}
          namespaces={namespaces}
          onChange={(namespace) =>
            setSettings((settings) => ({
              ...settings!,
              namespace,
            }))
          }
        />

        <Checkbox
          value={Boolean(settings?.namespacesDisabled)}
          onChange={(e) =>
            setSettings((settings) => ({
              ...settings!,
              namespacesDisabled: Boolean(e.currentTarget.checked),
            }))
          }
        >
          <Text>Hide namespace selectors</Text>
        </Checkbox>
      </div>
    </Fragment>
  );
};
