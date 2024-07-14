import React, { useEffect, useState } from "react";
import i18next from "i18next";

const withTranslations = (
  WrappedComponent: React.ComponentType,
  translationKeys: string | string[],
) => {
  return function WithTranslationsComponent(props: any) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      const loadTranslations = async () => {
        try {
          const keys = Array.isArray(translationKeys)
            ? translationKeys
            : [translationKeys];

          for (const key of keys) {
            const allTranslations = await import(`./translations/${key}.ts`);

            Object.keys(allTranslations.default).forEach((lang) => {
              const translations = allTranslations.default[lang].translation;
              i18next.addResourceBundle(
                lang,
                "translation",
                translations,
                true,
                true,
              );
            });
          }

          setIsLoaded(true);
        } catch (error) {
          console.error("Error loading translations:", error);
          setIsLoaded(true); // 即使加载失败也设置为已加载，以避免无限加载
        }
      };

      loadTranslations();
    }, []);

    if (!isLoaded) {
      return <div>Loading translations...</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withTranslations;
