import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/firebase';
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  Pin, 
  MoreVertical, 
  Trash2, 
  Flag,
  User,
  Megaphone,
  Bell,
  CornerDownRight
} from 'lucide-react';

interface CommunityCommentsProps {
  lectureId: string;
  studentName: string;
  isTeacher: boolean; // Prize of true if current user is Priyanshu
}

interface CommentItem {
  id: string;
  userName: string;
  text: string;
  isPinned: boolean;
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies?: Array<{
    id: string;
    userName: string;
    text: string;
    createdAt: string;
  }>;
}

export default function CommunityComments({ lectureId, studentName, isTeacher }: CommunityCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'likes'>('newest');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncements, setShowAnnouncements] = useState(true);

  // Subscribe to comments in real time
  useEffect(() => {
    const unsubscribe = dbService.subscribeComments(lectureId, (list) => {
      setComments(list);
    });
    return () => unsubscribe();
  }, [lectureId]);

  // Subscribe to announcements
  useEffect(() => {
    const unsubscribe = dbService.subscribeAnnouncements((list) => {
      setAnnouncements(list);
    });
    return () => unsubscribe();
  }, []);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      await dbService.addComment({
        lectureId,
        userName: studentName,
        text: newCommentText.trim(),
        likes: 0,
        likedBy: [],
        isPinned: false,
        replies: []
      });
      setNewCommentText('');
      addNotification("Comment posted successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (comment: CommentItem) => {
    const likedBy = comment.likedBy || [];
    const hasLiked = likedBy.includes(studentName);
    const newLikedBy = hasLiked 
      ? likedBy.filter(u => u !== studentName)
      : [...likedBy, studentName];
    
    const newLikes = hasLiked ? Math.max(0, comment.likes - 1) : comment.likes + 1;

    try {
      await dbService.updateComment(comment.id, {
        likes: newLikes,
        likedBy: newLikedBy
      });
      if (!hasLiked && comment.userName !== studentName) {
        addNotification(`${studentName} liked your comment!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (comment: CommentItem) => {
    if (!isTeacher) return;
    try {
      await dbService.updateComment(comment.id, {
        isPinned: !comment.isPinned
      });
      addNotification(`Comment ${!comment.isPinned ? 'pinned' : 'unpinned'}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await dbService.deleteComment(commentId);
      addNotification("Comment deleted.");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReply = async (comment: CommentItem) => {
    const replyText = replyTexts[comment.id];
    if (!replyText || !replyText.trim()) return;

    const replies = comment.replies || [];
    const newReply = {
      id: Math.random().toString(36).substring(2, 11),
      userName: studentName,
      text: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await dbService.updateComment(comment.id, {
        replies: [...replies, newReply]
      });
      setReplyTexts({ ...replyTexts, [comment.id]: '' });
      setActiveReplyId(null);
      addNotification(`Replied to ${comment.userName}'s comment.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!isTeacher) return;
    const text = prompt("Enter announcement text:");
    if (!text) return;
    const title = prompt("Enter announcement title:", "Weekly Study Challenge Details 🏆");
    if (!title) return;

    try {
      await dbService.addAnnouncement(text, title);
      addNotification("Announcement published!");
    } catch (err) {
      console.error(err);
    }
  };

  const addNotification = (text: string) => {
    setNotifications(prev => [text, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== text));
    }, 4000);
  };

  // Sort logic
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (sortBy === 'likes') {
      return b.likes - a.likes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* Real-time Toast Notification overlay */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none space-y-2">
        {notifications.map((n, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-900 text-white rounded-xl px-4 py-2.5 text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <Bell className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
            <span>{n}</span>
          </div>
        ))}
      </div>

      {/* Announcements Banner Section */}
      {announcements.length > 0 && showAnnouncements && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2 text-yellow-400">
              <Megaphone className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Teacher Announcements</span>
            </div>
            {isTeacher && (
              <button 
                onClick={handlePostAnnouncement}
                className="text-[10px] bg-yellow-400 text-black font-extrabold px-2 py-1 rounded hover:bg-yellow-300 cursor-pointer"
              >
                + New Alert
              </button>
            )}
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 2).map((a, i) => (
              <div key={i} className="text-xs">
                <h5 className="font-bold text-white mb-1">{a.title}</h5>
                <p className="text-zinc-400 leading-relaxed">{a.text}</p>
                <span className="text-[9px] text-zinc-600 font-mono mt-1 block">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Comment Form */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          Community Discussion ({comments.length})
        </h4>

        <form onSubmit={handlePostComment} className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-[11px] font-bold text-zinc-400">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Ask a doubt, answer a peer, or mention @Priyanshu..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2 pl-3 pr-10 text-xs text-white outline-none focus:border-zinc-700 placeholder-zinc-600 transition"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 text-zinc-400 hover:text-white cursor-pointer transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Sorting Control */}
      <div className="flex justify-between items-center text-[10px] text-zinc-500 border-b border-zinc-900 pb-2">
        <span>Showing {sortedComments.length} contributions</span>
        <div className="flex gap-2 font-mono">
          <button
            onClick={() => setSortBy('newest')}
            className={`cursor-pointer ${sortBy === 'newest' ? 'text-white font-bold' : 'hover:text-zinc-300'}`}
          >
            Newest
          </button>
          <span>|</span>
          <button
            onClick={() => setSortBy('likes')}
            className={`cursor-pointer ${sortBy === 'likes' ? 'text-white font-bold' : 'hover:text-zinc-300'}`}
          >
            Top Voted
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.map((comment) => {
          const hasLiked = (comment.likedBy || []).includes(studentName);
          const isOwnComment = comment.userName === studentName;
          const isTeacherComment = comment.userName === "Priyanshu";

          return (
            <div key={comment.id} className="border-b border-zinc-900/40 pb-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isTeacherComment 
                      ? 'bg-yellow-400 text-black border border-yellow-300 shadow'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                  }`}>
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isTeacherComment ? 'text-yellow-400' : 'text-white'}`}>
                        {comment.userName}
                      </span>
                      {isTeacherComment && (
                        <span className="text-[8px] bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-1 py-0.5 rounded-sm font-bold uppercase font-mono tracking-wider">
                          Educator
                        </span>
                      )}
                      {comment.isPinned && (
                        <span className="text-zinc-500" title="Pinned by Educator">
                          <Pin className="w-3 h-3 text-zinc-400 fill-zinc-400/20" />
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-1">
                  {isTeacher && (
                    <button
                      onClick={() => handleTogglePin(comment)}
                      className="p-1 hover:bg-zinc-900 rounded cursor-pointer transition text-zinc-500 hover:text-white"
                      title={comment.isPinned ? "Unpin comment" : "Pin comment"}
                    >
                      <Pin className={`w-3.5 h-3.5 ${comment.isPinned ? 'text-yellow-400 fill-yellow-400/20' : ''}`} />
                    </button>
                  )}
                  {(isOwnComment || isTeacher) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 hover:bg-zinc-900 rounded cursor-pointer transition text-zinc-600 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment Body */}
              <p className="text-xs text-zinc-300 leading-relaxed pl-9">
                {comment.text}
              </p>

              {/* Liking & Replying Actions */}
              <div className="flex items-center gap-3 pl-9 text-[10px]">
                <button
                  onClick={() => handleLike(comment)}
                  className={`flex items-center gap-1 cursor-pointer font-semibold ${
                    hasLiked ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} />
                  <span>{comment.likes}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                  }}
                  className="text-zinc-500 hover:text-zinc-300 cursor-pointer font-semibold"
                >
                  Reply
                </button>
              </div>

              {/* Active Reply Form */}
              {activeReplyId === comment.id && (
                <div className="pl-9 pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Reply to ${comment.userName}...`}
                    value={replyTexts[comment.id] || ''}
                    onChange={(e) => setReplyTexts({ ...replyTexts, [comment.id]: e.target.value })}
                    className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 px-3 text-xs text-white outline-none focus:border-zinc-700"
                  />
                  <button
                    onClick={() => handlePostReply(comment)}
                    className="bg-white text-black font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-zinc-200 cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-9 mt-2 space-y-2 border-l border-zinc-900">
                  {comment.replies.map((reply) => {
                    const isReplyTeacher = reply.userName === "Priyanshu";
                    return (
                      <div key={reply.id} className="pt-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CornerDownRight className="w-3 h-3 text-zinc-600" />
                          <span className={`text-[10px] font-bold ${isReplyTeacher ? 'text-yellow-400' : 'text-zinc-300'}`}>
                            {reply.userName}
                          </span>
                          {isReplyTeacher && (
                            <span className="text-[7px] bg-yellow-400/15 text-yellow-400 border border-yellow-400/20 px-1 py-0.2 rounded font-bold uppercase font-mono tracking-wider">
                              Educator
                            </span>
                          )}
                          <span className="text-[8px] text-zinc-600 font-mono">
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal pl-4">
                          {reply.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {sortedComments.length === 0 && (
          <div className="text-center py-6 text-xs text-zinc-600 font-medium">
            No doubts raised yet. Be the first to start the discussion! 🌟
          </div>
        )}
      </div>
    </div>
  );
}
