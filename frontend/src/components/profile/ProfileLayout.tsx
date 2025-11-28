import { ReactNode } from "react";
import "./Profile.css";

interface ProfileLayoutProps {
  header: ReactNode;
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}

export function ProfileLayout({ header, leftColumn, rightColumn }: ProfileLayoutProps) {
  return (
    <div className="profile-layout">

      {/* HEADER */}
      {header}

      {/* GRID */}
      <div className="profile-grid">

        {/* LEFT COLUMN */}
        <div className="profile-left-column">
          {leftColumn}
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-right-column">
          {rightColumn}
        </div>
      </div>
    </div>
  );
}
