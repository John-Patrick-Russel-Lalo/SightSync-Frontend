import { useState } from "react";
import { LogOut, X, Loader2, AlertTriangle } from "lucide-react";

export default function LogoutConfirmModal({ user = {}, onConfirm, onClose }) {
  const [signingOut, setSigningOut] = useState(false);

  const displayName =
    user?.display_name || user?.name || user?.username || user?.email || "your account";
  const role = user?.role ? user.role.toUpperCase() : "SESSION";

  const handleConfirm = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await onConfirm?.();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={signingOut}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-[#EBE3D8] transition disabled:opacity-50"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 border border-amber-200 text-amber-800 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-stone-900">Confirm Sign Out</h3>
            <p className="text-xs text-stone-500">Ending your {role} session</p>
          </div>
        </div>

        <p className="text-sm text-stone-700 leading-relaxed">
          Are you sure you want to sign out of{" "}
          <strong className="text-stone-900 font-semibold">{displayName}</strong>? You will need
          to log in again to access the portal, and any unsaved changes will be lost.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EBE3D8]">
          <button
            type="button"
            onClick={onClose}
            disabled={signingOut}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-[#E2D6C7] transition disabled:opacity-50"
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={signingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] shadow-sm transition disabled:opacity-60"
          >
            {signingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
