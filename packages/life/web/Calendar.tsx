import { useGetEntriesQuery } from "database/services";
import { nolotusId } from "core/init";

const Calendar = () => {
	const options = {
		isJSON: true,
		condition: {
			end_time: { exists: true }, // end_time键必须存在
			is_template: { equals: false }, // is_template键的值必须等于false
		},
		limit: 10000,
	};
	const { data, error, isLoading, isSuccess } = useGetEntriesQuery({
		userId: nolotusId,
		options,
	});
	console.log("data", data);
	return <div>xx</div>;
};
export default Calendar;
