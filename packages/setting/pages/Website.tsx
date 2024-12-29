import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { generateCustomId } from "core/generateMainKey";
import { nolotusId } from "core/init";
import { upsertData } from "database/dbSlice";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input } from "web/form/Input";
import Button from "web/ui/Button";
import { useTheme } from "app/theme";

const Website = () => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const userId = useAppSelector(selectCurrentUserId);

	const id = generateCustomId(userId, "website-settings");
	const { data, isLoading } = useFetchData(id);

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
		reset,
	} = useForm({
		defaultValues: data,
	});

	const onSubmit = async (data) => {
		try {
			//save for person
			await dispatch(upsertData({ id, data: data }));
			const nolotusSaveId = generateCustomId(nolotusId, "domain-list", {
				isObject: true,
			});
			//save domain list
			const writeAction = await dispatch(
				upsertData({
					id: nolotusSaveId,
					data: {
						[data.domain]: userId,
					},
				}),
			);
		} catch (error) { }
	};

	if (isLoading) {
		return null; // 或显示加载指示器
	}

	return (
		<>
			<style jsx>{`
        .website-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 32px;
          color: ${theme.text};
        }

        .form-section {
          background: ${theme.backgroundSecondary};
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: ${theme.text};
        }

        .label-description {
          font-size: 13px;
          color: ${theme.textSecondary};
          margin-bottom: 12px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .categories-section {
          margin-top: 32px;
        }

        .categories-title {
          font-size: 18px;
          font-weight: 500;
          color: ${theme.text};
          margin-bottom: 16px;
        }
      `}</style>

			<div className="website-container">
				<h2 className="section-title">
					{t('website.title', '网站设置')}
				</h2>

				<div className="form-section">
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="form-group">
							<label className="form-label">
								{t('website.domain', '网站域名')}
							</label>
							<div className="label-description">
								{t('website.domainDescription', '请输入您的网站域名')}
							</div>
							<Input
								{...register('domain')}
								placeholder={t('website.domainPlaceholder', '例如: example.com')}
								defaultValue={data?.domain}
							/>
						</div>

						<div className="actions">
							<Button
								type="submit"
								variant="primary"
								loading={isSubmitting}
							>
								{t('common.save', '保存')}
							</Button>
						</div>
					</form>
				</div>

				<div className="categories-section">
					<h3 className="categories-title">
						{t('website.categories', '分类')}
					</h3>
					{/* 分类内容可以在这里添加 */}
				</div>
			</div>
		</>
	);
};

export default Website;
