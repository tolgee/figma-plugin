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
import { CloseHandler, Node, TolgeeConfig, TranslationsUpdateHandler } from '../types';

function Plugin({ nodes, config }: {
  nodes: Array<Node>,
  config: TolgeeConfig
}) {
  const [openEdited, setOpenEdited] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(true);
  const [languages, setLanguages] = useState<Array<DropdownOption>>([{ value: config.lang }]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(config.lang);
  const [tolgeeData, setTolgeeData] = useState<Record<string, any> | null>(null);

  const [editedNodes, setEditedNodes] = useState<Node[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  useEffect(() => {
    setLoading(true);
    sendTolgeeRequest(`v2/projects/translations/${selectedLanguage}`, "GET", config as TolgeeConfig).then(res => {
      const tolgeeData = res?.data[selectedLanguage] ?? {};
      setTolgeeData(tolgeeData);
      setLoading(false);
      setEditedNodes(nodes.filter(node => Object.keys(tolgeeData).includes(node.name.slice(TOLGEE_PREFIX.length)) && tolgeeData[node.name.slice(TOLGEE_PREFIX.length)] !== node.characters))
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
    if (selectAll) {
      setSelectedNodes(editedNodes);
    } else {
      setSelectedNodes([]);
    }
  }, [editedNodes, selectAll]);

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
    emit<TranslationsUpdateHandler>("UPDATE_NODES", selectedNodes.map(node => ({ ...node, characters: tolgeeData?.[node.name.slice(TOLGEE_PREFIX.length)] ?? "SYNC FAILED" })));
    setSelectedNodes([]);
  }

  const handleClose = useCallback(function () {
    emit<CloseHandler>('CLOSE')
  }, []);

  if (loading) {
    return <MiddleAlign><LoadingIndicator /></MiddleAlign>
  }

  if (editedNodes.length === 0) {
    return <MiddleAlign>
      <Dropdown placeholder='Language' disabled={!languages.length} onChange={({ currentTarget: { value: lang } }) => setSelectedLanguage(lang)} options={languages} value={selectedLanguage} />
      <Columns space="extraSmall" style={{ display: "flex", alignItems: "center" }}>
        <IconCheckCircleFilled32 color="success" />
        No edited translations found.
      </Columns>
    </MiddleAlign>
  }

  return (
    <Container space="medium" >
      <div style={{ height: "calc(100% - 48px)", overflow: "auto" }}>
        <VerticalSpace space="large" />
        <Banner icon={<IconInfo32 />}>Checked Items will be synced to Figma.</Banner>
        <VerticalSpace space="medium" />
        <Dropdown placeholder='Language' disabled={!languages.length} onChange={({ currentTarget: { value: lang } }) => setSelectedLanguage(lang)} options={languages} value={selectedLanguage} />
        <VerticalSpace space="medium" />
        <SelectableItem onChange={() => setSelectAll(!selectAll)} value={selectAll}>
          Select All
        </SelectableItem>
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
      </div>
      <Columns space="extraSmall" style={{ bottom: "12px", position: "fixed", zIndex: 1, left: "12px", right: "12px" }}>
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