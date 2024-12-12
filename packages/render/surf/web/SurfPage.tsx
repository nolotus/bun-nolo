import { extractUserId } from "core";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "app/hooks";
import { deleteData } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import toast from "react-hot-toast";

import { ButtonGroup } from "../../page/ButtonGroup";
import SurfSpotPage from "./SurfSpotPage";

export const SurfPage = ({ pageId, data }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const createId = extractUserId(pageId);
  const isCreator = data.creator === auth.user?.userId;
  const isNotBelongAnyone = !data.creator;
  const allowEdit = isCreator || isNotBelongAnyone;
  const handleEdit = () => {
    navigate(`/${pageId}?edit=true`);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteData({ id: pageId }));
      toast.success("Page deleted successfully!");
      navigate("/");
    } catch (error) {
      alert("Error deleting page. Please try again.");
    }
  };
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>{createId}</div>
        <ButtonGroup
          onEdit={handleEdit}
          onDelete={handleDelete}
          allowEdit={allowEdit}
        />
      </div>
      <SurfSpotPage id={pageId} source={data.source} />
    </>
  );
};
