import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
import { Toast } from "toastify-react-native";
import { getMyBadges, markBadgeSeen, shareBadge } from "@/api/badgesThunk";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import BadgeUnlockedModal from "./BadgeUnlockedModal";

// Lives in the root layout. Badges are unlocked by the server when a session
// ends; any with seenAt: null get the pop-up once, then are marked seen.
// Checked on sign-in, whenever the app comes back to the foreground, and when
// a BADGE_UNLOCKED push arrives (the layout dispatches getMyBadges for it).
export default function BadgeUnlockWatcher() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { myBadges, loadingBadgeAction } = useAppSelector(
    (state) => state.badges,
  );
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(getMyBadges());
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") dispatch(getMyBadges());
    });
    return () => sub.remove();
  }, [isAuthenticated, dispatch]);

  // Show the newest unseen badge, one at a time.
  useEffect(() => {
    if (openId) return;
    const unseen = myBadges.find((badge) => !badge.seenAt);
    if (unseen) setOpenId(unseen._id);
  }, [myBadges, openId]);

  const badge = myBadges.find((b) => b._id === openId) ?? null;

  const handleClose = () => {
    if (openId) dispatch(markBadgeSeen(openId));
    setOpenId(null);
  };

  const handleShare = () => {
    if (!openId) return;
    dispatch(shareBadge({ badgeId: openId, shared: true }))
      .unwrap()
      .catch((err) =>
        Toast.show({ type: "error", text1: "Couldn't share", text2: err?.msg }),
      );
  };

  return (
    <BadgeUnlockedModal
      badge={isAuthenticated ? badge : null}
      sharing={loadingBadgeAction}
      onShare={handleShare}
      onClose={handleClose}
    />
  );
}
