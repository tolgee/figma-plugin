import { useMutation } from "react-query";
import { notifyEndpoint } from "../../main/endpoints/notify";
import { delayed } from "../../main/utils/delayed";

export const useFigmaNotify = () => {
  const result = useMutation<void, unknown, string>(
    [notifyEndpoint.name],
    delayed((props: string) => notifyEndpoint.call(props))
  );

  return { ...result };
};
