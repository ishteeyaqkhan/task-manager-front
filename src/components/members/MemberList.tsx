"use client";

import { UserMinus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Member } from "@/types";

interface MemberListProps {
  members: Member[];
  currentUserId: string | undefined;
  /** Owner-only: shows Remove buttons. */
  canManage: boolean;
  onRemove: (member: Member) => void;
}

export function MemberList({ members, currentUserId, canManage, onRemove }: MemberListProps) {
  const ownerCount = members.filter((member) => member.role === "OWNER").length;

  return (
    <ul className="divide-y divide-border">
      {members.map((member) => {
        const isSelf = member.userId === currentUserId;
        const isLastOwner = member.role === "OWNER" && ownerCount <= 1;
        return (
          <li key={member.userId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar name={member.user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {member.user.name}
                {isSelf && <span className="font-normal text-text-secondary"> (you)</span>}
              </p>
              <p className="truncate text-sm text-text-secondary">{member.user.email}</p>
            </div>
            <Badge tone={member.role === "OWNER" ? "primary" : "neutral"}>
              {member.role === "OWNER" ? "Owner" : "Member"}
            </Badge>
            {canManage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(member)}
                disabled={isLastOwner}
                title={isLastOwner ? "A project needs at least one owner" : undefined}
                aria-label={isLastOwner ? `${member.user.name} is the last owner and cannot be removed` : `Remove ${member.user.name}`}
                className="text-text-secondary hover:bg-error/10 hover:text-error"
              >
                <UserMinus className="size-4" aria-hidden="true" />
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
