import { useAppDispatch } from "app/hooks";
import { extractCustomId } from "core";
import { DataType } from "create/types";
import { deleteData, removeOne } from "database/dbSlice";
import { omit } from "rambda";
import { Link } from "react-router-dom";

const AIThead = () => {
  return (
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
  );
};

const PageThead = () => {
  return (
    <thead>
      <tr>
        <th>链接</th>
        <th>数据源</th>
        <th>操作</th>
      </tr>
    </thead>
  );
};

export const DataTable = ({ dataList, type }) => {
  const dispatch = useAppDispatch();

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
  const TR = ({ data }) => {
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
  };

  const PageTR = ({ data }) => {
    return (
      <tr>
        {/* <td>{extractCustomId(data.id)}</td> */}
        <td>
          <Link to={`/${data.id}`}>{data.id}</Link>
        </td>

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
  };
  return (
    <div>
      {/* {dataList.map((data) => {
        return <div>{JSON.stringify(data)}</div>;
      })} */}
      <table>
        {type === DataType.ChatRobot && <AIThead />}
        {type === DataType.Page && <PageThead />}

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
          {dataList.map((data) => (
            <>
              {type === DataType.ChatRobot && <TR data={data} key={data.id} />}
              {type === DataType.Page && <PageTR data={data} key={data.id} />}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};
