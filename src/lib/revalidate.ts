import { revalidatePath } from 'next/cache';

export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful fallback for non-Next request contexts (CLI, E2E scripts, background jobs)
  }
}
