'use client';

import { useCallback, useEffect, useState } from 'react';
import { API_ENDPOINTS } from "database/config";
import { useAppSelector } from 'app/hooks';
import { selectCurrentServer } from 'setting/settingSlice';
import Button from "web/ui/Button";

const PAGE_SIZE = 10;

export default function UsersPage() {
    const currentServer = useAppSelector(selectCurrentServer);
    const [state, setState] = useState({
        users: [],
        loading: true,
        error: null,
        page: 1,
        total: 0
    });

    const { users, loading, error, page, total } = state;

    const fetchUsers = useCallback(async () => {
        if (!currentServer) return;
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await fetch(
                `${currentServer}${API_ENDPOINTS.USERS}/users?page=${page}&pageSize=${PAGE_SIZE}`
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            setState(prev => ({
                ...prev,
                users: data.list,
                total: data.total,
                loading: false
            }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: '加载用户失败，请重试',
                loading: false,
                users: []
            }));
        }
    }, [currentServer, page]);

    const handleDeleteUser = async (userId) => {
        if (!confirm('确认删除该用户?')) return;

        try {
            const response = await fetch(
                `${currentServer}${API_ENDPOINTS.USERS}/users/${userId}`,
                { method: 'DELETE' }
            );
            if (!response.ok) throw new Error('删除失败');
            fetchUsers(); // 重新加载用户列表
        } catch (err) {
            alert('删除用户失败，请重试');
        }
    };

    const handleRecharge = async (userId) => {
        const amount = prompt('请输入充值金额:');
        if (!amount) return;

        try {
            const response = await fetch(
                `${currentServer}${API_ENDPOINTS.USERS}/users/${userId}/recharge`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: Number(amount) })
                }
            );
            if (!response.ok) throw new Error('充值失败');
            alert('充值成功');
            fetchUsers(); // 重新加载用户列表
        } catch (err) {
            alert('充值失败，请重试');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handlePageChange = useCallback((newPage) => {
        setState(prev => ({ ...prev, page: newPage }));
    }, []);

    if (!currentServer) {
        return <div className="p-4 text-center text-gray-600">请先选择服务器以查看用户列表</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl mb-6 font-bold">用户列表</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
                    <span className="text-red-600">{error}</span>
                    <Button onClick={fetchUsers} variant="secondary" size="small">重试</Button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Button loading variant="primary">加载中</Button>
                </div>
            ) : users.length > 0 ? (
                <>
                    <div className="overflow-hidden shadow-sm rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        用户名
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleRecharge(user.id)}
                                                    variant="primary"
                                                    size="small"
                                                >
                                                    充值
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    variant="danger"
                                                    size="small"
                                                >
                                                    删除
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            第 {page} 页，共 {Math.ceil(total / PAGE_SIZE)} 页
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                variant="secondary"
                                size="small"
                            >
                                上一页
                            </Button>
                            <Button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={users.length < PAGE_SIZE}
                                variant="secondary"
                                size="small"
                            >
                                下一页
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                    暂无用户数据
                </div>
            )}
        </div>
    );
}
