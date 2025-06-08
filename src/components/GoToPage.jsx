import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import '../styles/gotopage.css';

const GoToPage = ({ page, pageSize, rowCount, onPageChange }) => {
    const maxPage = Math.ceil(rowCount / pageSize) || 1;
    const [inputValue, setInputValue] = useState(page + 1);

    // Sync input value with page prop
    useEffect(() => {
        setInputValue(page + 1);
    }, [page]);

    const handleGo = () => {
        let val = parseInt(inputValue, 10);
        if (!isNaN(val)) {
            val = Math.max(1, Math.min(val, maxPage));
            if (val - 1 !== page) onPageChange(val - 1);
        }
    };

    const isGoDisabled = () => {
        const val = parseInt(inputValue, 10);
        return isNaN(val) || val < 1 || val > maxPage || (val - 1 === page);
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            className="gotopage-container"
        >
            <label htmlFor="gotopage-input">Page:</label>
            <input
                id="gotopage-input"
                className="gotopage-input"
                type="number"
                min={1}
                max={maxPage}
                value={inputValue}
                style={{ width: 60 }}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !isGoDisabled()) handleGo();
                }}
            />
            <button onClick={handleGo} disabled={isGoDisabled()}>Go</button>
            <button
                onClick={() => onPageChange(0)}
                disabled={page === 0}
                title="First page"
            >&#171; First</button>
            <button
                onClick={() => onPageChange(maxPage - 1)}
                disabled={page === maxPage - 1 || maxPage === 1}
                title="Last page"
            >Last &#187;</button>
        </Box>
    );
};

export default GoToPage;
