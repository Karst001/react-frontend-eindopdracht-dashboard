import React from 'react';
import { Grid } from "gridjs-react";
import 'gridjs/dist/theme/mermaid.css';
import './CustomGrid.css';

const CustomGrid = ({ data, columns, search, pagination, pageLimit, sort, gridKey, onCellClick, }) => {
    return (
        <div className="my-grid-wrapper">
            <Grid
                key={gridKey}
                data={data}
                columns={columns}
                search={search}
                pagination={{ enabled: pagination, limit: pageLimit }}
                sort={sort}
                className={{
                    table: 'custom-table',
                    thead: 'custom-header',
                    td: 'custom-cell',
                }}
                {...(onCellClick
                    ? {
                        eventEmitter: (emitter) => {
                            emitter.on('cellClick', (...args) => onCellClick(...args));
                        },
                    }
                    : {})}
            />
        </div>
    );
};

export default CustomGrid;