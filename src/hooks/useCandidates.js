// ─── useCandidates ──────────────────────────────────────────────────────────
// Custom hook for loading and saving candidate data from Firestore.

import { useState, useCallback } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { normalizeTranscript } from "../utils/transcript";

/**
 * Hook that manages the candidates list (load from Firestore, save new, local cache).
 *
 * @param {string|null} companyId - Company ID for scoped queries
 * @returns {{ candidates, setCandidates, loadCandidates, saveCandidate }}
 */
export default function useCandidates(companyId) {
  const [candidates, setCandidates] = useState([]);

  const loadCandidates = useCallback(async () => {
    try {
      const candidateList = [];
      const seenIds = new Set();

      // 1. Fetch completed sessions from company-scoped 'sessions' collection
      try {
        console.log("Loading from 'sessions' collection...");
        const sessionsRef = companyId
          ? collection(db, "companies", companyId, "sessions")
          : collection(db, "sessions");
        const q = query(sessionsRef, where("status", "==", "completed"));
        const snapshot = await getDocs(q);

        console.log(`Found ${snapshot.docs.length} completed sessions in 'sessions'`);

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const candidate = {
            id: doc.id,
            name: data.candidate_name || "Unknown",
            role: data.role || "Unknown",
            experience: data.experience_level || "Unknown",
            scores: data.scores || null,
            overall: data.overall_score || null,
            completedAt: data.scored_at
              ? new Date(data.scored_at)
              : data.completed_at
                ? new Date(data.completed_at)
                : new Date(),
            mode: "phone",
            transcript: normalizeTranscript(data.transcript),
            source: "sessions",
          };
          candidateList.push(candidate);
          seenIds.add(doc.id);
        });
        console.log(`Loaded ${candidateList.length} candidates from 'sessions' collection`);
      } catch (err) {
        console.error("Error loading from 'sessions' collection:", err);
      }

      // 2. Fetch scored interviews from company-scoped 'scored_interviews' collection
      try {
        console.log("Loading from 'scored_interviews' collection...");
        const scoredRef = companyId
          ? collection(db, "companies", companyId, "scored_interviews")
          : collection(db, "scored_interviews");
        const q = query(scoredRef);
        const snapshot = await getDocs(q);

        console.log(`Found ${snapshot.docs.length} interviews in 'scored_interviews'`);

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (!seenIds.has(doc.id)) {
            const candidate = {
              id: doc.id,
              name: data.name || "Unknown",
              role: data.role || "Unknown",
              experience: data.experience || "Unknown",
              scores: data.scores || null,
              overall: data.overall || null,
              completedAt: data.completedAt
                ? new Date(data.completedAt)
                : new Date(data.created_at),
              mode: data.mode || "phone",
              transcript: normalizeTranscript(data.transcript),
              source: "scored_interviews",
            };
            candidateList.push(candidate);
            seenIds.add(doc.id);
          }
        });
        console.log(`Total candidates now: ${candidateList.length}`);
      } catch (err) {
        console.error("Error loading from 'scored_interviews' collection:", err);
      }

      setCandidates(candidateList);
      localStorage.setItem("interviewai_candidates", JSON.stringify(candidateList));
      console.log(`Total candidates loaded: ${candidateList.length}`);
    } catch (err) {
      console.error("Error loading candidates from Firestore:", err);
      const stored = localStorage.getItem("interviewai_candidates");
      if (stored) {
        try {
          setCandidates(JSON.parse(stored));
        } catch {}
      }
    }
  }, [companyId]);

  const saveCandidate = useCallback(async (candidate) => {
    try {
      const scoredRef = companyId
        ? collection(db, "companies", companyId, "scored_interviews")
        : collection(db, "scored_interviews");
      await addDoc(scoredRef, {
        ...candidate,
        created_at: new Date().toISOString(),
      });

      setCandidates((prev) => {
        const updated = [...prev, candidate];
        localStorage.setItem("interviewai_candidates", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error("Error saving candidate to Firestore:", err);
      setCandidates((prev) => {
        const updated = [...prev, candidate];
        localStorage.setItem("interviewai_candidates", JSON.stringify(updated));
        return updated;
      });
    }
  }, [companyId]);

  return { candidates, setCandidates, loadCandidates, saveCandidate };
}
