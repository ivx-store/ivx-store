import { useState } from "react";
import { MessageSquareQuote, HelpCircle } from "lucide-react";
import { AdminTestimonials } from "./AdminTestimonials";
import { AdminFAQs } from "./AdminFAQs";

const tabs = [
  { id: "testimonials", label: "التعليقات", icon: <MessageSquareQuote size={18} /> },
  { id: "faqs", label: "الأسئلة الشائعة", icon: <HelpCircle size={18} /> },
];

export function AdminContent() {
  const [activeTab, setActiveTab] = useState("testimonials");

  return (
    <div>
      <div className="admin-content-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-content-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "testimonials" ? <AdminTestimonials /> : <AdminFAQs />}
    </div>
  );
}
