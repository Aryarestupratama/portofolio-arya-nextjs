"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Ctx = {
  setDirty: (id: string, dirty: boolean) => void;
  /**
   * Jika ada perubahan belum tersimpan: tampilkan dialog konfirmasi, kembalikan
   * `true` (aksi harus DITAHAN pemanggil) dan jalankan `run` hanya bila user
   * memilih "Discard & leave". Jika bersih: kembalikan `false` dan TIDAK
   * memanggil `run` — pemanggil lanjut seperti biasa.
   */
  blockIfDirty: (run: () => void) => boolean;
};

const UnsavedChangesContext = createContext<Ctx>({
  setDirty: () => {},
  blockIfDirty: () => false,
});

/**
 * Penjaga perubahan yang belum disimpan untuk seluruh area admin.
 * Mencegat: (1) klik link di dalam app (sidebar, breadcrumb, Cancel, dst),
 * (2) aksi yang dibungkus `confirmIfDirty` (mis. Logout), dan
 * (3) menutup/me-refresh tab (beforeunload).
 * Tombol Back/Forward browser TIDAK dicegat (App Router tidak menyediakan
 * API resmi untuk itu).
 */
export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dirtyIds = useRef(new Set<string>());
  const [pending, setPending] = useState<{ run: () => void } | null>(null);

  const setDirty = useCallback((id: string, dirty: boolean) => {
    if (dirty) dirtyIds.current.add(id);
    else dirtyIds.current.delete(id);
  }, []);

  const blockIfDirty = useCallback((run: () => void) => {
    if (dirtyIds.current.size === 0) return false;
    setPending({ run });
    return true;
  }, []);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyIds.current.size === 0) return;
      e.preventDefault();
      e.returnValue = "";
    }

    // Capture di document berjalan sebelum handler React/Next <Link>.
    function onClick(e: MouseEvent) {
      if (dirtyIds.current.size === 0) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor || !anchor.href) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Link ke halaman yang sama (mis. hanya hash) tidak meninggalkan form.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      e.preventDefault();
      e.stopPropagation();
      const href = url.pathname + url.search + url.hash;
      setPending({ run: () => router.push(href) });
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  function discardAndLeave() {
    const action = pending;
    // Kosongkan dulu supaya navigasi/submit berikutnya tidak dicegat lagi.
    dirtyIds.current.clear();
    setPending(null);
    action?.run();
  }

  return (
    <UnsavedChangesContext.Provider value={{ setDirty, blockIfDirty }}>
      {children}
      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              You have changes on this page that haven&apos;t been saved. If you leave now, they will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" autoFocus onClick={() => setPending(null)}>
              Keep editing
            </Button>
            <Button variant="destructive" onClick={discardAndLeave}>
              Discard &amp; leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UnsavedChangesContext.Provider>
  );
}

/** Daftarkan status dirty sebuah form ke penjaga global. Otomatis dilepas saat unmount. */
export function useUnsavedChanges(dirty: boolean) {
  const id = useId();
  const { setDirty } = useContext(UnsavedChangesContext);
  useEffect(() => {
    setDirty(id, dirty);
    return () => setDirty(id, false);
  }, [id, dirty, setDirty]);
}

/** Untuk aksi yang meninggalkan halaman (logout, dll): lihat `blockIfDirty`. */
export function useUnsavedGuard() {
  return useContext(UnsavedChangesContext).blockIfDirty;
}
