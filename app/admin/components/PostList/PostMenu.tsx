"use client";

import { ExternalLink, FilePen, Globe, PencilLine, SquarePen, Trash2 } from "lucide-react";
import type { PostSummary } from "@/lib/blog/types";
import ContextMenu, { MenuDivider, MenuItem, type MenuPoint } from "../ContextMenu/ContextMenu";

type Props = {
  post: PostSummary;
  /** Where the menu opens: the pointer, or the row for the keyboard menu key. */
  at: MenuPoint;
  onOpen: () => void;
  onRename: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onClose: () => void;
};

/** The right-click menu of a post in the list. */
export default function PostMenu({ post, at, onOpen, onRename, onToggleStatus, onDelete, onClose }: Props) {
  const published = post.status === "publish";
  // A post dated in the future is published but not on the site yet.
  const visible = published && (!post.publishedAt || new Date(post.publishedAt).getTime() <= Date.now());

  return (
    <ContextMenu label={`Akcje wpisu „${post.title}”`} at={at} onClose={onClose}>
      <MenuItem icon={<SquarePen size={15} aria-hidden="true" />} onSelect={onOpen}>
        Otwórz
      </MenuItem>
      {visible && (
        <MenuItem
          icon={<ExternalLink size={15} aria-hidden="true" />}
          onSelect={() => window.open(`/${post.slug}`, "_blank", "noopener")}
        >
          Zobacz na stronie
        </MenuItem>
      )}
      <MenuItem icon={<PencilLine size={15} aria-hidden="true" />} onSelect={onRename}>
        Zmień tytuł
      </MenuItem>
      <MenuItem
        icon={published ? <FilePen size={15} aria-hidden="true" /> : <Globe size={15} aria-hidden="true" />}
        onSelect={onToggleStatus}
      >
        {published ? "Przenieś do szkiców" : "Opublikuj"}
      </MenuItem>
      <MenuDivider />
      <MenuItem danger icon={<Trash2 size={15} aria-hidden="true" />} onSelect={onDelete}>
        Usuń wpis
      </MenuItem>
    </ContextMenu>
  );
}
