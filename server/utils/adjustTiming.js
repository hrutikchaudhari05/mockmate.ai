

function adjustTiming(questions, targetDuration) {

    const etRanges = {
        easy: { min: 150, max: 180 },
        medium: { min: 210, max: 270 },
        hard: { min: 300, max: 360 },
        advanced: { min: 390, max: 450 }
    };

    const wcRanges = {
        easy: { min: 50, max: 80 },
        medium: { min: 90, max: 140 },
        hard: { min: 150, max: 220 },
        advanced: { min: 230, max: 300 }
    };

    // Calculate current total if questions have et (from AI)
    let hasExistingTiming = questions[0]?.et !== undefined;

    if (!hasExistingTiming) {
        // Assign middle values if no timing from AI
        questions.forEach(q => {
            const etRange = etRanges[q.qd];
            q.et = Math.floor((etRange.min + etRange.max) / 2);
            const wcRange = wcRanges[q.qd];
            q.wc = Math.floor((wcRange.min + wcRange.max) / 2);
        });
    }

    // Now scale to target (works for any distribution)
    let totalTime = questions.reduce((sum, q) => sum + q.et, 0);
    let scale = targetDuration / totalTime;
    
    // Scale all questions proportionally
    questions.forEach(q => {
        const etRange = etRanges[q.qd];
        let newEt = Math.round(q.et * scale);
        q.et = Math.max(etRange.min, Math.min(etRange.max, newEt));
        
        // Adjust wc
        const wcRange = wcRanges[q.qd];
        const etMid = (etRange.min + etRange.max) / 2;
        const wcMid = (wcRange.min + wcRange.max) / 2;
        const ratio = q.et / etMid;
        q.wc = Math.round(wcMid * ratio);
        q.wc = Math.max(wcRange.min, Math.min(wcRange.max, q.wc));
    });

    // Step 3: Fine-tune to exact target
    totalTime = questions.reduce((sum, q) => sum + q.et, 0);
    let remainingDiff = targetDuration - totalTime;
    
    if (remainingDiff !== 0) {
        while (remainingDiff !== 0) {
            // Recalculate capacities each iteration
            const sortedIndices = questions
                .map((q, i) => ({ 
                    i, 
                    capacity: etRanges[q.qd].max - q.et,
                    minCapacity: q.et - etRanges[q.qd].min
                }))
                .filter(item => remainingDiff > 0 ? item.capacity > 0 : item.minCapacity > 0)
                .sort((a, b) => remainingDiff > 0 ? b.capacity - a.capacity : a.minCapacity - b.minCapacity);
            
            if (sortedIndices.length === 0) break;
            
            // Adjust one question per iteration
            const questionIdx = sortedIndices[0].i;
            const q = questions[questionIdx];
            const etRange = etRanges[q.qd];
            
            if (remainingDiff > 0 && q.et < etRange.max) {
                q.et += 1;
                remainingDiff -= 1;
            } else if (remainingDiff < 0 && q.et > etRange.min) {
                q.et -= 1;
                remainingDiff += 1;
            } else {
                break; // No more capacity
            }
            
            // Update wc
            const wcRange = wcRanges[q.qd];
            const etMid = (etRange.min + etRange.max) / 2;
            const wcMid = (wcRange.min + wcRange.max) / 2;
            const ratio = q.et / etMid;
            q.wc = Math.round(wcMid * ratio);
            q.wc = Math.max(wcRange.min, Math.min(wcRange.max, q.wc));
        }
    }

    // Warning check AFTER the while loop (not inside)
    if (Math.abs(remainingDiff) > 0) {
        console.warn(`Could not fully adjust: ${remainingDiff}s remaining`);
        const perQuestion = Math.round(remainingDiff / questions.length);
        questions.forEach(q => {
            q.et += perQuestion;
            // Recalculate wc if needed
            const wcRange = wcRanges[q.qd];
            const etRange = etRanges[q.qd];
            const etMid = (etRange.min + etRange.max) / 2;
            const wcMid = (wcRange.min + wcRange.max) / 2;
            const ratio = q.et / etMid;
            q.wc = Math.round(wcMid * ratio);
            q.wc = Math.max(wcRange.min, Math.min(wcRange.max, q.wc));
        });
    }

    // Final clamp to ensure ranges
    questions.forEach(q => {
        q.et = Math.max(etRanges[q.qd].min, Math.min(etRanges[q.qd].max, q.et));
        q.wc = Math.max(wcRanges[q.qd].min, Math.min(wcRanges[q.qd].max, q.wc));
    });

    // NEW: Round to nearest 5 seconds for cleaner values
    questions.forEach(q => {
        q.et = Math.round(q.et / 5) * 5;
        // Re-clamp after rounding (in case rounding pushed out of range)
        q.et = Math.max(etRanges[q.qd].min, Math.min(etRanges[q.qd].max, q.et));
    });

    // Verify
    const finalTotal = questions.reduce((sum, q) => sum + q.et, 0);
    console.log(`Target: ${targetDuration}s, Actual: ${finalTotal}s, Diff: ${targetDuration - finalTotal}s`);
    


    return questions;

} 

module.exports = adjustTiming;