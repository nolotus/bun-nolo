import { Combobox } from "web/form/Combobox";
import { availableProviderOptions } from "./providers";
import { FormField } from "web/form/FormField";

const getOrderedProviderOptions = () => {
  return [
    { name: "custom" },
    ...availableProviderOptions.map((item) => ({ name: item })),
  ];
};

interface ProviderSelectorProps {
  provider: string | null;
  setValue: (field: string, value: any) => void;
  providerInputValue: string;
  setProviderInputValue: (value: string) => void;
  t: (key: string) => string;
  error?: string;
}

const ProviderSelector = ({
  provider,
  setValue,
  providerInputValue,
  setProviderInputValue,
  t,
  error,
}: ProviderSelectorProps) => {
  return (
    <FormField
      label={t("provider")}
      required
      error={error}
      horizontal
      labelWidth="140px"
    >
      <Combobox
        items={getOrderedProviderOptions()}
        selectedItem={provider ? { name: provider } : null}
        onChange={(item) => {
          const newProvider = item?.name || "";
          setValue("provider", newProvider);
          setProviderInputValue(newProvider);
          if (newProvider !== "Custom") {
            setValue("customProviderUrl", "");
            setValue("model", "");
          }
        }}
        labelField="name"
        valueField="name"
        placeholder={t("selectProvider")}
        allowInput={true}
        onInputChange={(value) => setProviderInputValue(value)}
      />
    </FormField>
  );
};

export default ProviderSelector;
