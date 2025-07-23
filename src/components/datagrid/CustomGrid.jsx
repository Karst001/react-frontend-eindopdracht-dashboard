import React from 'react';
import {Grid} from "gridjs-react";
import 'gridjs/dist/theme/mermaid.css';
import './CustomGrid.css';

//using a 3rd party datagrid from React gridJs
const CustomGrid = ({ data, columns, search, pagination, pageLimit, sort }) => {
    return (
        <div className="my-grid-wrapper">
            <Grid
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
            />
        </div>
    );
};

export default CustomGrid;