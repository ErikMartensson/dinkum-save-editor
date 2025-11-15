import { containerData, saveData } from "../routes/index.tsx";
import FileSelect from "./FileSelect.tsx";
import FeaturesList from "../components/FeaturesList.tsx";

export default function FileSelectWrapper() {
  // This island will reactively hide when files are loaded
  const hasFiles = saveData.value || containerData.value;

  if (hasFiles) {
    return null;
  }

  return (
    <>
      <FeaturesList />
      <FileSelect />
    </>
  );
}
