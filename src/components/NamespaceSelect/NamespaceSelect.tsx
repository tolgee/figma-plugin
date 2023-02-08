import {
  Button,
  Container,
  Divider,
  Modal,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { Fragment, FunctionComponent, h } from "preact";
import { useState } from "preact/hooks";
import styles from "./NamespaceSelect.css";

type Props = {
  namespaces: string[];
  value: string;
  onChange: (value: string) => void;
  selectProps?: h.JSX.HTMLAttributes<HTMLSelectElement>;
};

const ADD_NEW_VALUE = Number.MAX_VALUE;

export const NamespaceSelect: FunctionComponent<Props> = ({
  value,
  namespaces,
  onChange,
  selectProps,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [nsName, setNsName] = useState<string>("");

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSetCustomValue = () => {
    onChange(nsName);
    setModalOpen(false);
  };

  return (
    <Fragment>
      <select
        value={value}
        onChange={(e) => {
          if (e.currentTarget.value === String(ADD_NEW_VALUE)) {
            onChange(value);
            setModalOpen(true);
          } else {
            onChange(e.currentTarget.value);
          }
        }}
        {...selectProps}
      >
        {namespaces?.map((namespace) => (
          <option key={namespace} value={namespace || ""}>
            {namespace || "<none>"}
          </option>
        ))}
        {!namespaces.includes(value) && <option value={value}>{value}</option>}
        <option value={ADD_NEW_VALUE}>+ Set custom</option>
      </select>
      <Modal
        open={modalOpen}
        title="Custom namespace"
        onCloseButtonClick={handleModalClose}
      >
        <div className={styles.modalBody}>
          <Container space="small">
            <VerticalSpace space="large" />
            <Textbox
              variant="border"
              placeholder="Insert namespace name"
              value={nsName}
              onChange={(e) => setNsName(e.currentTarget.value)}
              onKeyDownCapture={(e) => {
                if (e.key === "Enter") {
                  handleSetCustomValue();
                }
              }}
            />
            <VerticalSpace space="large" />
          </Container>
          <Divider />
          <Container space="small">
            <div className={styles.actions}>
              <Button onClick={handleSetCustomValue}>Set</Button>
            </div>
          </Container>
        </div>
      </Modal>
    </Fragment>
  );
};
