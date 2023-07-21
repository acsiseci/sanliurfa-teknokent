import React, { useState, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import {useRouter} from "next/router";


export default function Home({notes}) {
    let emptyNote = {
        id: null,
        createdDate: '',
        content: '',
        status: '',
    };

    const [noteDialog, setNoteDialog] = useState(false);
    const [deleteNoteDialog, setDeleteNoteDialog] = useState(false);
    const [note, setNote] = useState(emptyNote);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const router = useRouter();

    const refreshData = () => {
        router.replace(router.asPath);
    }

    const deleteNoteData =async (id) => {
        const res = await fetch('https://todo-app-production-e57d.up.railway.app/todo-list/api/v1/notes/' + id, {
            method: 'DELETE',
        })
        if (!res.ok) {
            throw new Error('Failed to fetch data')
        }
        return res
    }
    const createNoteData =async () => {
        const res = await fetch('https://todo-app-production-e57d.up.railway.app/todo-list/api/v1/notes', {
                method: 'POST',
            body: JSON.stringify(note),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        if (!res.ok) {
            throw new Error('Failed to fetch data')
        }
        return res
    }
    const updateNoteData =async () => {
        const res = await fetch('https://todo-app-production-e57d.up.railway.app/todo-list/api/v1/notes/' + note.id, {
            method: 'PUT',
            body: JSON.stringify(note),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        if (!res.ok) {
            throw new Error('Failed to fetch data')
        }
        return res
    }

    const openNew = () => {
        setNote(emptyNote);
        setSubmitted(false);
        setNoteDialog(true);
    }
    const hideDialog = () => {
        setSubmitted(false);
        setNoteDialog(false);
    }
    const hideDeleteProductDialog = () => {
        setDeleteNoteDialog(false);
    }

    const saveNote = async () => {
        setSubmitted(true);
        if (note.id) {
            await updateNoteData()
            toast.current.show({severity: 'success', summary: 'Successful', detail: 'Note Updated', life: 3000});
        } else {
            await createNoteData()
            toast.current.show({severity: 'success', summary: 'Successful', detail: 'Note Created', life: 3000});
        }
        setNoteDialog(false);
        setNote(emptyNote);
        refreshData()

    }
    const editNote = (note) => {
        setNote({...note});
        setNoteDialog(true);
    }
    const deleteNote = async () => {
        await deleteNoteData(note.id)
        refreshData()
        setDeleteNoteDialog(false);
        setNote(emptyNote);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Note Deleted', life: 3000 });
    }

    const confirmDeleteProduct = (note) => {
        setNote(note);
        setDeleteNoteDialog(true);
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _note = {...note};
        _note[`${name}`] = val;
        setNote(_note);
    }
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editNote(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteProduct(rowData)} />
            </React.Fragment>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:align-items-center justify-content-between">
            <span className="p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." className="w-full lg:w-auto" />
            </span>
            <div className="mt-3 md:mt-0 flex justify-content-end">
                <Button icon="pi pi-plus" className="mr-2 p-button-rounded" onClick={openNew} tooltip="New" tooltipOptions={{position: 'bottom'}} />
            </div>
        </div>
    );
    const noteDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveNote} />
        </React.Fragment>
    );

    const deleteNoteDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteNote} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo surface-card p-4 border-round shadow-2">
            <Toast ref={toast} />
            <div className="text-3xl text-800 font-bold mb-4">ToDo List</div>
            <DataTable ref={dt} value={notes}
                dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} notes"
                globalFilter={globalFilter} header={header} responsiveLayout="scroll">
                <Column field="content" header="Content" sortable ></Column>
                <Column field="status" header="Status" sortable ></Column>
                <Column field="createdDate" header="Created Date" sortable></Column>
                <Column body={actionBodyTemplate} exportable={false}></Column>
            </DataTable>

            <Dialog visible={noteDialog} breakpoints={{'960px': '75vw', '640px': '100vw'}} style={{width: '40vw'}} header="Note Details" modal className="p-fluid" footer={noteDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name">Content</label>
                    <InputText id="name" value={note.content} onChange={(e) => onInputChange(e, 'content')} required autoFocus className={classNames({ 'p-invalid': submitted && !note.content })} />
                    {submitted && !note.content && <small className="p-error">Name is required.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteNoteDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteNoteDialogFooter}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
                    {note && <span>Are you sure you want to delete <b>{note.content}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
}

export const getServerSideProps = async () => {
    const res = await fetch('https://todo-app-production-e57d.up.railway.app/todo-list/api/v1/notes')
    const notes = await res.json()
    return { props: { notes } }
}
