import { useAppDispatch } from "app/hooks";
import { extractCustomId } from "core";
import { deleteData, removeOne } from "database/dbSlice";
import { omit } from "rambda";

export const DataTable = ({ dataList }) => {
  const dispatch = useAppDispatch();

  return (
    <div>
      {/* {dataList.map((data) => {
        return <div>{JSON.stringify(data)}</div>;
      })} */}
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>数据类型</th>
            <th>AI名字</th>
            <th>AI所用模型</th>
            <th>AI 定制描述</th>
            <th>AI 回复规则</th>
            <th>AI 知识</th>
            <th>数据源</th>
            <th>操作</th>
          </tr>
        </thead>
        {/* <tfoot>
          <tr>
            <th>Table Footer 1</th>
            <th>Table Footer 2</th>
            <th>Table Footer 3</th>
            <th>Table Footer 4</th>
            <th>Table Footer 5</th>
          </tr>
        </tfoot> */}
        <tbody>
          {dataList.map((data) => {
            // const formatValue = omit(
            //   [
            //     "id",
            //     "name",
            //     "description",
            //     "model",
            //     "type",
            //     "path",
            //     "replyRule",
            //     "knowledge",
            //   ],
            //   data,
            // );

            return (
              <tr>
                <td>{extractCustomId(data.id)}</td>
                <td>{data.type}</td>
                <td>{data.name}</td>
                <td>{data.model}</td>
                <td>{data.description}</td>
                <td>{data.replyRule}</td>
                <td>{data.knowledge}</td>
                <td>{data.source}</td>
                <td>
                  <button
                    onClick={() => {
                      dispatch(deleteData(data.id));
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
