import { useAppSelector, useFetchData } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { useAuth } from "auth/useAuth";
import { generateIdWithCustomId } from "core/generateMainKey";
import { useTranslation } from "react-i18next";
import { PageLoader } from "render/blocks/PageLoader";

const UserProfile = () => {
	const auth = useAuth();
	const { t } = useTranslation();

	const customId = "user-profile";
	const userId = useAppSelector(selectCurrentUserId);
	const flags = { isJSON: true };
	const id = generateIdWithCustomId(userId, customId, flags);
	const { data, isLoading } = useFetchData(id);
	if (isLoading) {
		return <PageLoader />;
	}

	return (
		<div>
			<h3 className="mb-4 ">个人资料</h3>
			<div className="mb-4">
				<p className="mb-2 ">用户名: {auth.user?.username}</p>
				<p className="mb-2 ">用户Id: {auth.user?.userId}</p>
			</div>
		</div>
	);
};

export default UserProfile;
