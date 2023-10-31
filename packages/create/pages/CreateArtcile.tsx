import { createFieldsFromDSL } from 'components/Form/createFieldsFromDSL';
import { createZodSchemaFromDSL } from 'database/schema/createZodSchemaFromDSL';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getLogger } from 'utils/logger';

import { CreateArticleForm } from '../blocks/CreateArticleForm';
import { createArticle } from '../request/createArtcile';

const schemaLogger = getLogger('schema');

const CreateArticle = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const formDSL = {
    path: {
      type: 'string',
      min: 1,
      optional: true,
    },
    title: {
      type: 'string',
      min: 1,
    },
    content: {
      type: 'textarea',
      min: 1,
    },
  };

  const schema = createZodSchemaFromDSL(formDSL);
  schemaLogger.info('Created Zod schema:', schema);
  const fields = createFieldsFromDSL(formDSL);

  const onSubmit = (data) => {
    createArticle(data, navigate, setError);
  };

  return (
    <div className="flex items-center justify-center  bg-gray-100">
      <div className="w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          {t('createArticle')}
        </h2>
        <div className="mx-auto">
          <CreateArticleForm
            schema={schema}
            fields={fields}
            onSubmit={onSubmit}
            errors={error}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
