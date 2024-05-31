import { useApiQuery } from "@/ui/client/useQueryApi";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { NamespaceSelect } from "@/ui/components/NamespaceSelect/NamespaceSelect";
import { TolgeeConfig } from "@/types";
import {
  VerticalSpace,
  Text,
  Muted,
  Checkbox,
  Textbox,
} from "@create-figma-plugin/ui";
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

  if (
    settings?.namespace !== undefined &&
    !namespaces.includes(settings.namespace)
  ) {
    namespaces.push(settings.namespace);
  }
  const namespacesNotPresent = namespaces?.length === 1 && !namespaces[0];

  useEffect(() => {
    if (!settings && namespacesLoadable.data && languagesLoadable.data) {
      setSettings({
        language:
          initialData?.language || languages?.find((l) => l.base)?.tag || "",
        namespace: initialData?.namespace ?? namespaces?.[0] ?? "",
        namespacesDisabled:
          initialData?.namespacesDisabled ?? namespacesNotPresent,
        ignoreNumbers: initialData?.ignoreNumbers ?? true,
        ignorePrefix: initialData?.ignorePrefix ?? "_",
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
      <VerticalSpace space="extraLarge" />
      <Text>
        <Muted>Ignore text nodes prefixed with:</Muted>
      </Text>
      <VerticalSpace space="small" />
      <Textbox
        data-cy="settings_input_ignore_prefix"
        onValueInput={(ignorePrefix) => {
          setSettings((settings) => ({
            ...settings,
            ignorePrefix,
          }));
        }}
        value={settings?.ignorePrefix ?? "_"}
        variant="border"
      />
      <VerticalSpace space="small" />
      <VerticalSpace space="small" />
      <Checkbox
        value={Boolean(settings?.ignoreNumbers)}
        onChange={(e) =>
          setSettings((settings) => ({
            ...settings!,
            ignoreNumbers: Boolean(e.currentTarget.checked),
          }))
        }
      >
        <Text>Ignore nodes with numbers</Text>
      </Checkbox>
    </Fragment>
  );
};
