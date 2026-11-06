import { useEffect, useState } from "react";
import { courseFor, defaultFilters, type WalkCourse, type WalkFilters } from "./walkData";
export default function useWalkCourse(filters: WalkFilters = defaultFilters, alternative = 0, enabled = true) {
    const [course, setCourse] = useState<WalkCourse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const key = JSON.stringify([filters.duration, filters.course, filters.social, filters.intensity, filters.time, alternative]);
    useEffect(() => {
        let active = true;
        setCourse(null); setError(null);
        if (enabled) courseFor(filters, alternative).then(result => { if (active) setCourse(result); })
            .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "코스를 불러오지 못했어요."); });
        return () => { active = false; };
    }, [key, enabled, revision]);
    return { "course": course, "error": error, "retry": () => setRevision(value => value + 1) };
}
