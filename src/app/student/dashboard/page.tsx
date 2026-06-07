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
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {studentName}!</h1>
          <p>Here is your academic overview and upcoming schedule for today.</p>
        </div>
        <div className="btn btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}>
          View Full Schedule
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid-dashboard" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: "2rem" }}>
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Cumulative GPA</span>
            <span className="dash-tag tag-success">Active</span>
          </div>
          <span className="dash-card-value">3.84</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Top 10% of class rank</p>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Completed Credits</span>
            <span className="dash-tag tag-primary">Degree</span>
          </div>
          <span className="dash-card-value">84 / 120</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>70% requirements met</p>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Average Attendance</span>
            <span className="dash-tag tag-primary">Term</span>
          </div>
          <span className="dash-card-value">96.5%</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Target: &gt;90.0%</p>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Tasks In Progress</span>
            <span className="dash-tag tag-warning">Urgent</span>
          </div>
          <span className="dash-card-value">3</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Due in the next 7 days</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid-dashboard" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Left Side: Courses */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "between", alignItems: "center", width: "100%" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Your Active Courses</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {courses.map((course) => (
              <div key={course.id} className="dash-card" style={{ padding: "1.25rem", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>{course.name}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>{course.code}</p>
                  </div>
                  <span className="dash-tag tag-primary">{course.grade}</span>
                </div>
                
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    <span>Course Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Deadlines and Announcements */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Upcoming Deadlines */}
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Upcoming Tasks</h2>
            
            <ul className="dash-list">
              {assignments.map((task) => (
                <li key={task.id} className="dash-list-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600 }}>{task.title}</span>
                    <span className={`dash-tag ${task.type === 'exam' ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                      {task.type}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <span>{task.course}</span>
                    <span>Due: {task.due}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Announcements */}
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Campus Notices</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {announcements.map((notice) => (
                <div key={notice.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{notice.title}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{notice.date}</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{notice.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
