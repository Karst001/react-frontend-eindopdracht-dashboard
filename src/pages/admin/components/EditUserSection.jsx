
import React from 'react';
import CustomGrid from '../../../components/datagrid/CustomGrid.jsx';
import Button from "../../../components/button/Button.jsx";
import PopupMessage from "../../../components/popupmessage/PopupMessage.jsx";
import ErrorMessage from "../../../components/errormessage/ErrorMessage.jsx";

const EditUserSection = ({
                             userData,
                             error,
                             popupMessage,
                             canSubmitEditUser,
                             isOnline,
                             handleUpdateUsers,
                             resetForm,
                             setPopupMessage,
                         }) => {

    const gridKey = `edit-users-${userData?.length ?? 0}`;

    const columns = [
        { name: 'User name', width: '90px' },
        { name: 'Full name', width: '115px' },
        { name: 'Email', width: '160px' },
        { name: 'Admin?', width: '65px' },
        { name: 'Enabled?', width: '75px' },
        { name: 'Locked?', width: '90px' },
    ];

    return (
        <section className="admin-section">
            <h2>Edit users:</h2>

            <>
                <CustomGrid
                    gridKey={gridKey}
                    data={userData}
                    columns={columns}
                    search={true}
                    pagination={true}
                    pageLimit={6}
                    sort={false}
                />

                {(!userData || userData.length === 0) && <p>No users found.</p>}
            </>

            {error && <ErrorMessage message={error} />}

            <Button onClick={handleUpdateUsers} disabled={!canSubmitEditUser || !isOnline}>
                Update User
            </Button>

            <PopupMessage
                message={popupMessage}
                onClose={() => {
                    setPopupMessage('');
                    resetForm();
                }}
            />
        </section>
    );
};

export default EditUserSection;

