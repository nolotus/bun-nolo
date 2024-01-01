import React, { useState } from "react";
const learningModules = {
	studyModules: [
		{
			title: " 计算机学习",
			end_time: "2023-01-06",
			remainingDays: null, // 这里初设为null，随后在组件中计算具体天数
			subjects: [
				{
					name: "Java",
					videos: 2,
				},
				{
					name: "嵌入式",
					videos: 13,
				},
				{
					name: "电子商务",
					videos: 6,
				},
			],
		},
		{
			title: "日语学习",
			daily: true,
		},
	],
};
const calculateRemainingDays = (deadline) => {
	const today = new Date();
	const dueDate = new Date(deadline);
	const timeDiff = dueDate - today;
	return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

const MyDashboard = () => {
	learningModules.studyModules.forEach((module) => {
		if (module.deadline) {
			module.remainingDays = calculateRemainingDays(module.deadline);
		}
	});
	const [modules, setModules] = useState([]);

	const handleAddModule = () => {
		// 使用唯一键值（如时间戳）来区分每个模块
		const newModule = {
			id: Date.now(),
			name: "新模块",
			content: "新模块的内容",
		};
		setModules([...modules, newModule]);
	};

	return (
		<div>
			<div style={{ display: "flex", alignItems: "center" }}>
				<h1>My Dashboard</h1>
				<button
					type="button"
					onClick={handleAddModule}
					style={{
						marginLeft: "10px",
						padding: "5px 10px",
						backgroundColor: "#007bff",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					新建一列
				</button>
			</div>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				{/* 学习模块 */}
				<div>
					<h2>学习</h2>
					{learningModules.studyModules.map((module, index) => (
						<div key={index}>
							<h3>{module.title}</h3>
							{module.deadline && (
								<>
									<p>
										截止日期：{new Date(module.deadline).toLocaleDateString()}
									</p>
									<p>剩余时间：{module.remainingDays}天</p>
								</>
							)}
							{module.subjects && (
								<ul>
									{module.subjects.map((subject, idx) => (
										<li key={idx}>
											{subject.name} - {subject.videos}个视频
										</li>
									))}
								</ul>
							)}
							{module.daily && <p>每日打卡，无截止期限</p>}
						</div>
					))}
				</div>

				{/* 移动端模块 */}
				<div>
					<h2>Nolo移动端</h2>
					<div>
						<h3>安卓端</h3>
						{/* 安卓端模块内容 */}
					</div>
					<div>
						<h3>iOS端</h3>
						{/* iOS端模块内容 */}
					</div>
				</div>

				{/* Nolotus官网模块 */}
				<div>
					<h2>Nolotus官网</h2>
					{/* Nolotus官网模块内容 */}
				</div>
				{modules.map((module) => (
					<div key={module.id}>
						<h2>{module.name}</h2>
						<p>{module.content}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default MyDashboard;
