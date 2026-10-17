import FeaturesList from "../components/FeaturesList.tsx";
import { containerData, saveData } from "../utils/state.ts";
import FileSelect from "./FileSelect.tsx";

export default function FileSelectWrapper() {
  // This island will reactively hide when files are loaded
  const hasFiles = saveData.value || containerData.value;

  if (hasFiles) {
    return null;
  }

  return (
    <>
      <FileSelect />
      <FeaturesList />
    </>
  );
}
