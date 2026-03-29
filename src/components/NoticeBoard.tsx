import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Notice } from '../types';
import { Plus, Trash2, Calendar, Clock, Bell, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NoticeBoard() {
  const { notices, saveNotice, deleteNotice, role } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({
    title: '',
    content: '',
    deploymentDate: new Date().toISOString().split('T')[0],
    deploymentTime: new Date().toTimeString().slice(0, 5),
  });

  const isAdmin = role === 'admin' || role === 'superadmin';

  const handleSave = async () => {
    if (!newNotice.title || !newNotice.content || !newNotice.deploymentDate || !newNotice.deploymentTime) return;
    
    const notice: Notice = {
      id: editingNotice ? editingNotice.id : Date.now().toString(),
      title: newNotice.title,
      content: newNotice.content,
      deploymentDate: newNotice.deploymentDate,
      deploymentTime: newNotice.deploymentTime,
      createdAt: editingNotice ? editingNotice.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveNotice(notice);
    setIsAdding(false);
    setEditingNotice(null);
    setNewNotice({
      title: '',
      content: '',
      deploymentDate: new Date().toISOString().split('T')[0],
      deploymentTime: new Date().toTimeString().slice(0, 5),
    });
  };

  const startEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setNewNotice({
      title: notice.title,
      content: notice.content,
      deploymentDate: notice.deploymentDate,
      deploymentTime: notice.deploymentTime,
    });
    setIsAdding(true);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="text-blue-500" />
            Notice Board
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Official announcements and updates for the QC Department</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
          >
            <Plus size={20} />
            Post Notice
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-blue-100 dark:border-blue-900/30 mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Send size={18} className="text-blue-500" />
              Create New Notice
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter notice title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deployment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={newNotice.deploymentDate}
                    onChange={(e) => setNewNotice({ ...newNotice, deploymentDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deployment Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="time"
                    value={newNotice.deploymentTime}
                    onChange={(e) => setNewNotice({ ...newNotice, deploymentTime: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  rows={4}
                  className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Write your notice here..."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingNotice(null);
                }}
                className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                {editingNotice ? 'Update Notice' : 'Publish Notice'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No notices posted yet.</p>
          </div>
        ) : (
          notices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{notice.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(notice.deploymentDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {notice.deploymentTime}
                      </span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 transition-all">
                    <button
                      onClick={() => startEdit(notice)}
                      className="text-gray-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      <span className="text-xs font-bold">Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        console.log('Delete button clicked for:', notice.id);
                        if (window.confirm('Delete this notice?')) {
                          console.log('Confirmed delete for:', notice.id);
                          deleteNotice(notice.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {notice.content}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
