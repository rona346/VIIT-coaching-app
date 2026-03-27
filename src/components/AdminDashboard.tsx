import { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, limit, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const data = [
  { name: "Jan", students: 400, revenue: 2400 },
  { name: "Feb", students: 300, revenue: 1398 },
  { name: "Mar", students: 200, revenue: 9800 },
  { name: "Apr", students: 278, revenue: 3908 },
  { name: "May", students: 189, revenue: 4800 },
  { name: "Jun", students: 239, revenue: 3800 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    revenue: 0,
    pendingFees: 0,
  });

  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    role: "student",
    batchId: "",
    courseId: "",
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      // Mocking stats for now
      setStats({
        totalStudents: 1248,
        activeCourses: 12,
        revenue: 45200,
        pendingFees: 8400,
      });

      const q = query(collection(db, "users"), where("role", "==", "student"), limit(5));
      const querySnapshot = await getDocs(q);
      const students = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecentStudents(students);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "users");
    }
  };

  const fetchMetadata = async () => {
    try {
      const coursesSnap = await getDocs(collection(db, "courses"));
      let coursesData = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (coursesData.length === 0) {
        // Seed some initial courses if empty
        const initialCourses = [
          { name: "Full Stack Web Development", fees: 1500, duration: "6 Months" },
          { name: "UI/UX Design", fees: 1000, duration: "3 Months" },
          { name: "Data Science", fees: 2000, duration: "8 Months" }
        ];
        for (const c of initialCourses) {
          await addDoc(collection(db, "courses"), c);
        }
        const newSnap = await getDocs(collection(db, "courses"));
        coursesData = newSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setCourses(coursesData);
      
      const batchesSnap = await getDocs(collection(db, "batches"));
      let batchesData = batchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (batchesData.length === 0 && coursesData.length > 0) {
        // Seed some initial batches if empty
        const initialBatches = [
          { name: "Morning Batch (A1)", timing: "09:00 AM - 11:00 AM", courseId: coursesData[0].id },
          { name: "Evening Batch (B1)", timing: "06:00 PM - 08:00 PM", courseId: coursesData[0].id }
        ];
        for (const b of initialBatches) {
          await addDoc(collection(db, "batches"), b);
        }
        const newSnap = await getDocs(collection(db, "batches"));
        batchesData = newSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setBatches(batchesData);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMetadata();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In a real app, we might use Firebase Admin SDK to create the user in Auth
      // For this demo, we'll just create the firestore document
      // We use a random ID since we don't have the Auth UID yet
      const studentData = {
        ...newStudent,
        uid: `temp_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        enrolledCourses: [newStudent.courseId],
      };

      await addDoc(collection(db, "users"), studentData);
      
      setSuccessMessage("Student added successfully!");
      setNewStudent({ name: "", email: "", role: "student", batchId: "", courseId: "" });
      fetchStats();
      
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "users");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteStudent = async (id: string) => {
    try {
      const { deleteDoc, doc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "users", id));
      fetchStats();
      setConfirmDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Courses",
      value: stats.activeCourses,
      change: "+2",
      trend: "up",
      icon: BookOpen,
      color: "purple",
    },
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      change: "+18%",
      trend: "up",
      icon: CreditCard,
      color: "green",
    },
    {
      title: "Pending Fees",
      value: `$${stats.pendingFees.toLocaleString()}`,
      change: "-5%",
      trend: "down",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-600 font-medium hover:bg-neutral-50 transition-all">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="text-neutral-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-neutral-900">Enrollment Growth</h3>
            <select className="bg-neutral-50 border-none text-sm font-medium rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    border: "1px solid #eee",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#000"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-neutral-900">Revenue Analysis</h3>
            <button className="text-sm font-medium text-neutral-500 hover:text-neutral-900">View Report</button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    border: "1px solid #eee",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="revenue" fill="#000" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-neutral-900">Recent Students</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-neutral-200 w-full md:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-8 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Student</th>
                <th className="px-8 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Course</th>
                <th className="px-8 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Batch</th>
                <th className="px-8 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Joined</th>
                <th className="px-8 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentStudents.length > 0 ? (
                recentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 font-bold">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{student.name}</p>
                          <p className="text-xs text-neutral-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-neutral-600">
                      {courses.find(c => c.id === student.courseId)?.name || student.courseId || "N/A"}
                    </td>
                    <td className="px-8 py-4 text-sm text-neutral-600">
                      {batches.find(b => b.id === student.batchId)?.name || student.batchId || "N/A"}
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-neutral-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {confirmDeleteId === student.id ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs font-bold text-neutral-400 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmDeleteId(student.id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-neutral-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
            >
              <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-900">Add New Student</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="p-8 space-y-6">
                {successMessage ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900">{successMessage}</h4>
                    <button
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setSuccessMessage("");
                      }}
                      className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded-xl font-bold"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-1.5">Full Name</label>
                        <input
                          required
                          type="text"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-1.5">Email Address</label>
                        <input
                          required
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-1.5">Course</label>
                          <select
                            required
                            value={newStudent.courseId}
                            onChange={(e) => setNewStudent({ ...newStudent, courseId: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                          >
                            <option value="">Select Course</option>
                            {courses.length > 0 ? (
                              courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                            ) : (
                              <>
                                <option value="web-dev">Web Development</option>
                                <option value="ui-ux">UI/UX Design</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-1.5">Batch</label>
                          <select
                            required
                            value={newStudent.batchId}
                            onChange={(e) => setNewStudent({ ...newStudent, batchId: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                          >
                            <option value="">Select Batch</option>
                            {batches.length > 0 ? (
                              batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                            ) : (
                              <>
                                <option value="morning">Morning Batch</option>
                                <option value="evening">Evening Batch</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Student"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
