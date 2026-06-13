"use client";

import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  
  const studentName = userProfile?.displayName || user?.displayName || "Student";

  // Mock data for student academic details
  const courses = [
    { id: 1, name: "Advanced Mathematics & Calculus", code: "MTH-401", progress: 78, grade: "A-" },
    { id: 2, name: "Introduction to Computer Science", code: "CS-101", progress: 92, grade: "A" },
    { id: 3, name: "Organic Chemistry II", code: "CHM-202", progress: 45, grade: "B" },
    { id: 4, name: "English Literature & Rhetoric", code: "ENG-112", progress: 60, grade: "B+" },
  ];

  const assignments = [
    { id: 1, title: "Calculus Problem Set 4", course: "MTH-401", due: "Tomorrow, 11:59 PM", type: "homework" },
    { id: 2, title: "React Web App Project Submission", course: "CS-101", due: "June 12, 5:00 PM", type: "project" },
    { id: 3, title: "Midterm Exam Preparation Quiz", course: "CHM-202", due: "June 15, 10:00 AM", type: "exam" },
  ];

  const announcements = [
    { id: 1, title: "Campus Library Extended Hours", date: "June 6", desc: "The library will be open 24/7 during final exam week starting next Monday." },
    { id: 2, title: "Fall Semester Enrollment Open", date: "June 4", desc: "Course registration for the upcoming semester is now active on the portal." },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back, {studentName}!</h1>
          <p className="text-muted-foreground text-sm md:text-base">Here is your academic overview and upcoming schedule for today.</p>
        </div>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap">
          View Full Schedule
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border shadow-sm rounded-xl p-5 flex flex-col gap-3 transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground">Cumulative GPA</span>
            <span className="bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-2 py-0.5 rounded-md">Active</span>
          </div>
          <span className="text-3xl font-black text-foreground">3.84</span>
          <p className="text-xs text-muted-foreground">Top 10% of class rank</p>
        </div>

        <div className="bg-card border shadow-sm rounded-xl p-5 flex flex-col gap-3 transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground">Completed Credits</span>
            <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2 py-0.5 rounded-md">Degree</span>
          </div>
          <span className="text-3xl font-black text-foreground">84 / 120</span>
          <p className="text-xs text-muted-foreground">70% requirements met</p>
        </div>

        <div className="bg-card border shadow-sm rounded-xl p-5 flex flex-col gap-3 transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground">Average Attendance</span>
            <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2 py-0.5 rounded-md">Term</span>
          </div>
          <span className="text-3xl font-black text-foreground">96.5%</span>
          <p className="text-xs text-muted-foreground">Target: &gt;90.0%</p>
        </div>

        <div className="bg-card border shadow-sm rounded-xl p-5 flex flex-col gap-3 transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground">Tasks In Progress</span>
            <span className="bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-2 py-0.5 rounded-md">Urgent</span>
          </div>
          <span className="text-3xl font-black text-foreground">3</span>
          <p className="text-xs text-muted-foreground">Due in the next 7 days</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Courses */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-foreground">Your Active Courses</h2>
          
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-card border shadow-sm rounded-xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{course.name}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">{course.code}</p>
                  </div>
                  <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-1 rounded-md shrink-0">
                    {course.grade}
                  </span>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground font-medium mb-1.5">
                    <span>Course Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Deadlines and Announcements */}
        <div className="space-y-8">
          {/* Upcoming Deadlines */}
          <div className="bg-card border shadow-sm rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-foreground">Upcoming Tasks</h2>
            
            <ul className="space-y-3">
              {assignments.map((task) => (
                <li key={task.id} className="bg-muted/50 border rounded-lg p-3 text-sm transition-colors hover:bg-muted">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <span className="font-semibold text-foreground truncate">{task.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${task.type === 'exam' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                      {task.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>{task.course}</span>
                    <span>Due: {task.due}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Announcements */}
          <div className="bg-card border shadow-sm rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-foreground">Campus Notices</h2>
            
            <div className="space-y-4">
              {announcements.map((notice, i) => (
                <div key={notice.id} className={i !== announcements.length - 1 ? "border-b pb-4" : ""}>
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h4 className="font-semibold text-foreground text-sm">{notice.title}</h4>
                    <span className="text-xs text-muted-foreground font-medium shrink-0">{notice.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{notice.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
