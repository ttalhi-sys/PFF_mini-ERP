

/**
 * Generates a sequential code for entities (e.g., WO-2025-013)
 * @param supabase The initialized supabase client (server or client)
 * @param prefix The prefix for the code (e.g., 'WO' for Work Orders, 'EQP' for Equipment)
 * @param tableName The Supabase table to query for the last code
 * @param columnName The specific column to check (defaults to 'code')
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateSequentialCode(supabase: any, prefix: string, tableName: string, columnName: string = 'code'): Promise<string> {
    const year = new Date().getFullYear();
    
    if (prefix === 'EQP') {
        const pattern = 'EQP-%';
        const { data, error } = await supabase
            .from(tableName)
            .select(columnName)
            .like(columnName, pattern)
            .order(columnName, { ascending: false })
            .limit(1);

        if (error) {
            console.error(`Error fetching last code for EQP:`, error);
            return `EQP-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
        }

        let nextSequence = 1;
        if (data && data.length > 0) {
            const lastCode = data[0][columnName];
            if (lastCode) {
                const parts = lastCode.split('-');
                if (parts.length === 2) {
                    const lastSequence = parseInt(parts[1], 10);
                    if (!isNaN(lastSequence)) {
                        nextSequence = lastSequence + 1;
                    }
                }
            }
        }
        return `EQP-${nextSequence.toString().padStart(6, '0')}`;
    }

    const pattern = `${prefix}-${year}-%`;

    const { data, error } = await supabase
        .from(tableName)
        .select(columnName)
        .like(columnName, pattern)
        .order(columnName, { ascending: false })
        .limit(1);

    if (error) {
        console.error(`Error fetching last code for ${prefix}:`, error);
        // Fallback if error occurs
        return `${prefix}-${year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }

    let nextSequence = 1;

    if (data && data.length > 0) {
        const lastCode = data[0][columnName];
        if (lastCode) {
            const parts = lastCode.split('-');
            if (parts.length === 3) {
                const lastSequence = parseInt(parts[2], 10);
                if (!isNaN(lastSequence)) {
                    nextSequence = lastSequence + 1;
                }
            }
        }
    }

    // Format with leading zeros (e.g., 001, 013, 142)
    const formattedSequence = nextSequence.toString().padStart(3, '0');

    return `${prefix}-${year}-${formattedSequence}`;
}
