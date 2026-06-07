"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ParentDashboard() {
  const { user, userProfile } = useAuth();
  
  const parentName = userProfile?.displayName || user?.displayName || "Parent";

  // Mock children list
  const children = [
    { id: 1, name: "Alex Mercer", grade: "11th Grade", avatar: "👨‍🎓", gpa: "3.84", attendance: "96.5%", school: "Soma High School" },
    { id: 2, name: "Emily Mercer", grade: "9th Grade", avatar: "👩‍🎓", gpa: "3.62", attendance: "94.2%", school: "Soma Middle School" }
  ];

  const [selectedChildId, setSelectedChildId] = useState(1);
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  // Mock data for payments
  const payments = [
    { id: 1, item: "Fall Term Tuition Fee", amount: "$3,450.00", due: "June 30, 2026", status: "unpaid", child: "Alex Mercer" },
    { id: 2, item: "Sports & Lab Resource Fee", amount: "$280.00", due: "June 25, 2026", status: "unpaid", child: "Alex Mercer" },
    { id: 3, item: "Transportation Fee - May", amount: "$150.00", due: "Paid On June 1", status: "paid", child: "Emily Mercer" }
  ];

  // Mock recent school activities/logs for active child
  const childActivities = {
    1: [
      { id: 1, type: "grade", title: "New Grade Posted: CS-101", detail: "Scored 96/100 on React Web App Project Submission", time: "2 hours ago" },
      { id: 2, type: "attendance", title: "Marked Present: Morning Session", detail: "Registered present at 8:14 AM", time: "Today" },
      { id: 3, type: "teacher", title: "Teacher Note: Mr. Davis (Math)", detail: "'Alex is showing exceptional performance in our calculus preparation modules.'", time: "Yesterday" }
    ],
    2: [
      { id: 1, type: "attendance", title: "Marked Present: Morning Session", detail: "Registered present at 8:22 AM", time: "Today" },
      { id: 2, type: "grade", title: "New Grade Posted: Biology 1", detail: "Scored 88/100 on Genetics Worksheet", time: "June 5" },
      { id: 3, type: "teacher", title: "Meeting Scheduled: parent-teacher meeting", detail: "Scheduled for June 10, 4:00 PM with Mrs. Gable", time: "June 4" }
    ]
  };

  const activeActivities = childActivities[selectedChild.id as 1 | 2] || [];

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {parentName}!</h1>
          <p>Monitor your children&apos;s academic status, schedule, and complete school payments.</p>
        </div>
        
        {/* Child Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <label htmlFor="child-select" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)" }}>
            Viewing Profile:
          </label>
          <select
            id="child-select"
            className="form-select"
            style={{ padding: "0.5rem 1.5rem 0.5rem 1rem", fontSize: "0.95rem" }}
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(Number(e.target.value))}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name} ({child.grade})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Child Summary Stats */}
      <div className="grid-dashboard" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginBottom: "2rem" }}>
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Student Profile</span>
            <span style={{ fontSize: "1.5rem" }}>{selectedChild.avatar}</span>
          </div>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.25rem" }}>{selectedChild.name}</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "-0.5rem" }}>
            {selectedChild.grade} • {selectedChild.school}
          </p>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Cumulative GPA</span>
            <span className="dash-tag tag-success">Excellent</span>
          </div>
          <span className="dash-card-value">{selectedChild.gpa}</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Calculated for current term</p>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Attendance Rate</span>
            <span className="dash-tag tag-primary">Good</span>
          </div>
          <span className="dash-card-value">{selectedChild.attendance}</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Target is above 90.0%</p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid-dashboard" style={{ gridTemplateColumns: "2fr 1fr" }}>
        
        {/* Left Side: Recent Academic/Student Activities */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            Recent Activity for {selectedChild.name}
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {activeActivities.length > 0 ? (
              activeActivities.map((act) => (
                <div
                  key={act.id}
                  className="dash-card"
                  style={{
                    padding: "1.25rem",
                    borderLeft: `4px solid ${act.type === 'grade' ? 'var(--success)' : act.type === 'teacher' ? 'var(--primary)' : 'var(--secondary)'}`,
                    borderRadius: "4px var(--border-radius-md) var(--border-radius-md) 4px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{act.title}</h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{act.time}</span>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px", lineHeight: 1.4 }}>
                    {act.detail}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Right Side: Fee Payments and Teacher Contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Outstanding Bills */}
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Finances & Tuition</h2>
            
            <ul className="dash-list">
              {payments.map((pay) => (
                <li key={pay.id} className="dash-list-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{pay.item}</span>
                    <span className={`dash-tag ${pay.status === 'paid' ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                      {pay.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <span>For {pay.child}</span>
                    <span style={{ fontWeight: 700, color: pay.status === 'unpaid' ? 'var(--text-main)' : 'var(--text-muted)' }}>{pay.amount}</span>
                  </div>
                  {pay.status === 'unpaid' && (
                    <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "0.75rem", alignSelf: "flex-end", marginTop: "6px", width: "fit-content" }}>
                      Pay Invoice
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions / Contact */}
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "flex-start" }}>
                💬 Message School Admin
              </button>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "flex-start" }}>
                📅 Book Parent-Teacher Meeting
              </button>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "flex-start" }}>
                📄 Request Transcript / Reports
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
