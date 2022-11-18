import {
  Banner,
  Button,
  Columns,
  Container,
  Disclosure,
  Dropdown,
  DropdownOption,
  IconCheckCircleFilled32,
  IconInfo32,
  LoadingIndicator,
  MiddleAlign,
  render,
  SelectableItem,
  Stack,
  VerticalSpace
} from '@create-figma-plugin/ui';
import { emit } from '@create-figma-plugin/utilities';
import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { sendTolgeeRequest, TOLGEE_PREFIX } from '../tolgee';
import '!../styles.css';
import { CloseHandler, SyncCompleteHandler, TolgeeConfig, TranslationsUpdateHandler } from '../types';

interface Node {
  name: string;
  characters: string;
  id: string;
}

interface TolgeeUpdatePromiseResponse {
  status: "fulfilled" | string,
  value: null | {
    status: 200 | number,
    data: {
      keyId: number,
      keyName: string,
      translations: {
        [lang: string]: {
          id: number,
          text: string,
          state: string,
          auto: boolean,
        }
      }
    }
  }
}

function Plugin({ nodes, conflictingNodes, config }: {
  nodes: Array<Node>, conflictingNodes: Array<Node>,
  config: TolgeeConfig
}) {
  const [openDuplicates, setOpenDuplicates] = useState(true);
  const [openNew, setOpenNew] = useState(true);
  const [openEdited, setOpenEdited] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(true);
  const [languages, setLanguages] = useState<Array<DropdownOption>>([{ value: config.lang }]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(config.lang);
  const [tolgeeData, setTolgeeData] = useState<Record<string, any> | null>(null);

  const [duplicateNodes, setDuplicateNodes] = useState<Node[]>([]);
  const [newNodes, setNewNodes] = useState<Node[]>([]);
  const [editedNodes, setEditedNodes] = useState<Node[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  useEffect(() => {
    setLoading(true);
    sendTolgeeRequest(`v2/projects/translations/${selectedLanguage}`, "GET", config as TolgeeConfig).then(res => {
      const tolgeeData = res?.data[selectedLanguage];
      setTolgeeData(tolgeeData);
      setLoading(false);
      if (tolgeeData) {
        setNewNodes(nodes.filter(node => !Object.keys(tolgeeData).includes(node.name.slice(TOLGEE_PREFIX.length)) && !conflictingNodes.find(n => n.name === node.name)));
        setDuplicateNodes(nodes.filter(node => !!conflictingNodes.find(n => n.name === node.name)));
        setEditedNodes(nodes.filter(node => Object.keys(tolgeeData).includes(node.name.slice(TOLGEE_PREFIX.length)) && tolgeeData[node.name.slice(TOLGEE_PREFIX.length)] !== node.characters && !conflictingNodes.find(n => n.name === node.name)))
      }
    });
  }, [selectedLanguage])

  useEffect(() => {
    setLoading(true);
    sendTolgeeRequest("v2/projects/languages", "GET", config as TolgeeConfig).then(res => {
      if (res && res.status === 200 && res.data?._embedded?.languages?.length) {
        setLoading(false);
        setLanguages(res.data._embedded.languages.map((l: any) => ({ value: l.tag, text: l.name })));
      }
    })
  }, []);

  useEffect(() => {
    console.log(nodes);
    if (selectAll) {
      setSelectedNodes(nodes.filter(node => !conflictingNodes.find(n => n.name === node.name && n.characters !== node.characters)));
    } else {
      setSelectedNodes([]);
    }
  }, [nodes, selectAll]);

  const toggleNode = (node: Node) => {
    if (selectedNodes.includes(node)) {
      setSelectedNodes(selectedNodes.filter(n => n !== node));
    } else {
      if (selectedNodes.find(n => n.name === node.name)) {
        setSelectedNodes([...selectedNodes.filter(n => n.name !== node.name), node])
      } else {
        setSelectedNodes([...selectedNodes, node])
      }
    }
  }

  const syncKeys = () => {
    setLoading(true);
    const promises: Array<Promise<TolgeeUpdatePromiseResponse["value"]>> = [];
    selectedNodes.forEach(node => {
      promises.push(sendTolgeeRequest("v2/projects/translations", "POST", config, JSON.stringify({ key: node.name.slice(TOLGEE_PREFIX.length), translations: { [config.lang]: node.characters }, languagesToReturn: [config.lang] })));
    });
    Promise.allSettled(promises).then(results => {
      const successfulResults = results.filter(r => r.status === "fulfilled").map(res => res.status === "fulfilled" && res.value?.data).map(d => d ? { key: d.keyName, value: d.translations[config.lang].text } : null).filter(r => !!r?.value);
      const affectedDuplicatedNodes = [];
      for (const result of successfulResults) {
        setSelectedNodes([]);
        affectedDuplicatedNodes.push(...duplicateNodes.filter(n => n.name.slice(TOLGEE_PREFIX.length) === result!.key).map(n => ({ ...n, value: result!.value })));
        console.log("affectedDuplicatedNodes ", affectedDuplicatedNodes)
      }
      if (affectedDuplicatedNodes.length > 1) {
        emit<TranslationsUpdateHandler>("UPDATE_NODES", affectedDuplicatedNodes)
      } else {
        emit<SyncCompleteHandler>("SYNC_COMPLETE");
      }
    });
  }

  const handleClose = useCallback(function () {
    emit<CloseHandler>('CLOSE')
  }, []);

  if (loading) {
    return <MiddleAlign><LoadingIndicator /></MiddleAlign>
  }

  if (newNodes.length === 0 && duplicateNodes.length === 0 && editedNodes.length === 0) {
    return <MiddleAlign>
      <Columns space="extraSmall" style={{ display: "flex", alignItems: "center" }}>
        <IconCheckCircleFilled32 color="success" />
        No new, edited or duplicate translations found.
      </Columns>
    </MiddleAlign>
  }

  return (
    <Container space="medium" >
      <VerticalSpace space="large" />
      <Banner icon={<IconInfo32 />}>Checked Items will be synced to Tolgee.</Banner>
      {/* <VerticalSpace space="medium" />
      <Dropdown placeholder='Language' disabled={!languages.length} onChange={({ currentTarget: { value: lang } }) => setSelectedLanguage(lang)} options={languages} value={selectedLanguage} /> */}
      <VerticalSpace space="medium" />
      <SelectableItem onChange={() => setSelectAll(!selectAll)} value={selectAll}>
        Select All
      </SelectableItem>
      <VerticalSpace space="medium" />
      {duplicateNodes.length ? <Disclosure onClick={() => setOpenDuplicates(!openDuplicates)} open={openDuplicates} title="Duplicate Keys">
        {duplicateNodes.map((node) => (
          <SelectableItem key={node.id} onChange={() => toggleNode(node)} value={!!selectedNodes.includes(node)}>
            {node.name?.slice(TOLGEE_PREFIX.length)}: {node.characters}
          </SelectableItem>)
        )}
      </Disclosure> : <div />}
      {newNodes.length ? <Disclosure onClick={() => setOpenNew(!openNew)} open={openNew} title="New Keys">
        {newNodes.map((node) => (
          <SelectableItem key={node.id} onChange={() => toggleNode(node)} value={!!selectedNodes.includes(node)}>
            {node.name?.slice(TOLGEE_PREFIX.length)}: {node.characters}
          </SelectableItem>)
        )}
      </Disclosure> : <div />}
      {editedNodes.length ? <Disclosure onClick={() => setOpenEdited(!openEdited)} open={openEdited} title="Edited Keys">
        {editedNodes.map((node) => (
          <SelectableItem style={{ height: "auto", padding: "var(--space-small) var(--space-small) var(--space-small) var(--space-medium);" }} key={node.id} onChange={() => toggleNode(node)} value={!!selectedNodes.includes(node)}>
            <Stack space='extraSmall'>
              <Container space='extraSmall'>{node.name?.slice(TOLGEE_PREFIX.length)}: {node.characters}</Container>
              <Container space='extraSmall'>Tolgee: {tolgeeData?.[node.name.slice(TOLGEE_PREFIX.length)] ?? ""}</Container>
            </Stack>
          </SelectableItem>)
        )}
      </Disclosure> : <VerticalSpace space='extraSmall' />}
      <VerticalSpace space="extraLarge" />
      <Columns space="extraSmall" style={{ bottom: "12px", position: "absolute", left: "12px", right: "12px" }}>
        <Button disabled={selectedNodes.length === 0} fullWidth onClick={syncKeys}>
          Sync
        </Button>
        <Button fullWidth onClick={handleClose} secondary>
          Close
        </Button>
      </Columns>
    </Container>
  )
}

export default render(Plugin)