import { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion } from "motion/react";
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react";

export default function StudentDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      // Mocking data for now
      setTasks([
        { id: "1", title: "React Hooks Assignment", dueDate: "2026-04-01", status: "pending" },
        { id: "2", title: "Tailwind CSS Project", dueDate: "2026-03-25", status: "submitted" },
      ]);

      setCourses([
        { id: "1", name: "Full Stack Web Development", progress: 65, instructor: "John Doe" },
        { id: "2", name: "UI/UX Design Fundamentals", progress: 30, instructor: "Jane Smith" },
      ]);

      setFees([
        { id: "1", amount: 500, date: "2026-03-01", status: "paid" },
        { id: "2", amount: 500, date: "2026-04-01", status: "pending" },
      ]);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Student Portal</h1>
          <p className="text-neutral-500 mt-1">Track your progress and manage your learning.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200">
            <Download className="w-4 h-4" />
            Download ID Card
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Courses & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enrolled Courses */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Enrolled Courses</h3>
              <button className="text-sm font-medium text-neutral-500 hover:text-neutral-900">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-neutral-50 text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-1">{course.name}</h4>
                  <p className="text-sm text-neutral-500 mb-6">Instructor: {course.instructor}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-600">Progress</span>
                      <span className="font-bold text-neutral-900">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-neutral-900 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Pending Tasks */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Pending Tasks</h3>
              <button className="text-sm font-medium text-neutral-500 hover:text-neutral-900">View All</button>
            </div>
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-neutral-100">
                {tasks.map((task) => (
                  <div key={task.id} className="p-6 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${task.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                        {task.status === 'pending' ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">{task.title}</h4>
                        <p className="text-sm text-neutral-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      task.status === 'pending' 
                        ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                        : 'bg-neutral-100 text-neutral-400 cursor-default'
                    }`}>
                      {task.status === 'pending' ? 'Submit Now' : 'Submitted'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Fee Status & Certificates */}
        <div className="space-y-8">
          {/* Fee Status */}
          <section className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900">Fee Status</h3>
              <CreditCard className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {fees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">${fee.amount}</p>
                    <p className="text-xs text-neutral-500">{new Date(fee.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    fee.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {fee.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              ))}
              <button className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all mt-2">
                Pay Now
              </button>
            </div>
          </section>

          {/* Certificates */}
          <section className="bg-neutral-900 p-8 rounded-3xl text-white shadow-xl shadow-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Certificates</h3>
              <Award className="w-6 h-6 text-neutral-400" />
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Web Dev Basics</p>
                    <p className="text-xs text-neutral-400">Issued Jan 2026</p>
                  </div>
                </div>
                <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-neutral-400 text-center mt-4">
                Complete your courses to unlock more certificates.
              </p>
            </div>
          </section>

          {/* Quick Support */}
          <section className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Need Help?</h3>
            </div>
            <p className="text-sm text-blue-100 mb-6 leading-relaxed">
              Have questions about your courses or fees? Our support team is here to help you.
            </p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all">
              Contact Support
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
