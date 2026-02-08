"use client";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1 p-1 bg-card rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
            activeTab === tab.id
              ? "bg-accent text-white shadow-glow-sm"
              : "text-muted hover:text-primary hover:bg-panel"
          }`}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
