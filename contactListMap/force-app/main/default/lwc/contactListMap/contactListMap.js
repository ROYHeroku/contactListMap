import {LightningElement, track, /*wire,*/ api} from 'lwc';

                    // importing apex class methods
import getContacts from '@salesforce/apex/contactListMapController.getContacts';
import delSelectedCons from '@salesforce/apex/contactListMapController.deleteContacts';
import getContacsCount from '@salesforce/apex/contactListMapController.getContacsCount'; 
 

                    // importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

                    // importing to refresh the apex if any record changes the datas
import {refreshApex} from '@salesforce/apex';

                    // row actions
const actions = [
    { label: 'Record Details', name: 'record_details'}, 
    { label: 'Edit', name: 'edit'}, 
    { label: 'Delete', name: 'delete'},
    { label: 'View in MAP', name: 'view_in_map'}
];

// datatable columns with row actions
const columns = [
    { label: 'FirstName', fieldName: 'FirstName' }, 
    { label: 'LastName', fieldName: 'LastName' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone'}, 
    { label: 'Email', fieldName: 'Email', type: 'email' }, 
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'right'
        }
    }
];

export default class ContactListMap extends LightningElement { 
    // reactive variable
    @track data;
    @track columns = columns;
    @track record = [];
    @track bShowModal = false;
    @track bShowModalMap = false;
    @track currentRecordId;
    @track isEditForm = false;
    @track isMapForm = false;    
    @track showLoadingSpinner = false;
    @track mapMarkers = [];
    @track markersTitle = 'SR Foundation Pvt. Ltd.';
    @track zoomLevel = 4;

    @track accounts;  
    @track error;  
    @api currentpage;  
    @api pagesize;  
    @track searchKey;  
   totalpages;  
   localCurrentPage = null;  
   isSearchChangeExecuted = false;

    // non-reactive variables
    selectedRecords = [];
    refreshTable;
    error;

    handleKeyChange(event) {  
        if (this.searchKey !== event.target.value) {  
          this.isSearchChangeExecuted = false;  
          this.searchKey = event.target.value;  
          this.currentpage = 1;  
        }  
      }  

      renderedCallback() {  
                                    // This line added to avoid duplicate/multiple executions of this code.  
        if (this.isSearchChangeExecuted && (this.localCurrentPage === this.currentpage)) {  
          return;  
        }  
        this.isSearchChangeExecuted = true;  
        this.localCurrentPage = this.currentpage;  
        getContacsCount({ searchString: this.searchKey })  
          .then(recordsCount => {  
            this.totalrecords = recordsCount;  
            if (recordsCount !== 0 && !isNaN(recordsCount)) {  
              this.totalpages = Math.ceil(recordsCount / this.pagesize);  
              getContacts({ pagenumber: this.currentpage, numberOfRecords: recordsCount, pageSize: this.pagesize, searchString: this.searchKey })  
                .then(accountList => {  
                  this.accounts = accountList;  
                  this.error = undefined;  
                })  
                .catch(error => {  
                  this.error = error;  
                  this.accounts = undefined;  
                });  
                
            } else {  
              this.accounts = [];  
              this.totalpages = 1;  
              this.totalrecords = 0;  
            }  
            const event = new CustomEvent('recordsload', {  
              detail: recordsCount  
            });  
            this.dispatchEvent(event);  
          })  
          .catch(error => {  
            this.error = error;  
            this.totalrecords = undefined;  
          });  
      }  
/* Load address information based on accountNameParam from Controller */

    // retrieving the data using wire service
  /* @wire(getContacts,{ pagenumber: '$currentpage', numberOfRecords: '$recordsCount', pageSize: '$pagesize', searchString: '$searchKey'})
    contacts(result) {
        this.refreshTable = result;
        if (result.data) {
            this.accounts = result.data;
            this.error = undefined;       

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }*/

    handleRowActions(event) {
        let actionName = event.detail.action.name;
        window.console.log('actionName ====> ' + actionName);
        let row = event.detail.row;
        window.console.log('row ====> ' + row);
                          // eslint-disable-next-line default-case
        switch (actionName) {
            case 'view_in_map':
                this.viewMapRecord(row);
                break;
            case 'record_details':
                this.viewCurrentRecord(row);
                break;
            case 'edit':
                this.editCurrentRecord(row);
                break;
            case 'delete':
                this.deleteCons(row);
                break;
        }
    }
                        // view the current record details
      viewMapRecord(currentRow) {
        this.mapMarkers="";
          if (currentRow) { 
                this.mapMarkers = [...this.mapMarkers ,
                    {
                        location: {
                            City: currentRow.MailingStreet,
                            Country: currentRow.MailingCountry,
                        },        
                        icon: 'custom:custom26',
                        title: currentRow.Name,
                        description: currentRow.MailingStreet,
                        }                                    
                ];
            }
        this.isMapForm = true;
        this.bShowModalMap = true; 
        this.bShowModal = false;      
        this.record = currentRow;
    }

                        // view the current record details
    viewCurrentRecord(currentRow) {
        this.bShowModalMap = false; 
        this.bShowModal = true;
        this.isEditForm = false;
        this.record = currentRow;
    }

                        // closing modal box
    closeModal() {
        this.bShowModal = false;
        this.bShowModalMap = false; 
    }
    
    editCurrentRecord(currentRow) {
                        // open modal box
        this.bShowModalMap = false; 
        this.bShowModal = true;
        this.isEditForm = true;
                        // assign record id to the record edit form
        this.currentRecordId = currentRow.Id;         
    }

                        // handleing recordedit form submit
    handleSubmit(event) {
                        // prevending default type sumbit of recordedit form
        event.preventDefault();

                        // querying the recordedit form and submiting fields to form
        this.template.querySelector('lightning-record-edit-form').submit(event.detail.fields);

                        // closing modal
        this.bShowModal = false;
        this.bShowModalMap = false; 

                        // showing success message
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success!!',
            message: event.detail.fields.FirstName + ' '+ event.detail.fields.LastName +' Contact updated Successfully!!.',
            variant: 'success'
        }),);
    }

                        // refreshing the datatable after record edit form success
    handleSuccess() {
        return refreshApex(this.refreshTable);
    }

    deleteCons(currentRow) {
        let currentRecord = [];
        currentRecord.push(currentRow.Id);
        this.showLoadingSpinner = true;

                        // calling apex class method to delete the selected contact
        delSelectedCons({lstConIds: currentRecord})
        .then(result => {
            window.console.log('result ====> ' + result);
            this.showLoadingSpinner = false;

                        // showing success message
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success!!',
                message: currentRow.FirstName + ' '+ currentRow.LastName +' Contact are deleted.',
                variant: 'success'
            }),);

                        // refreshing table data using refresh apex
             return refreshApex(this.refreshTable);

        })
        .catch(error => {
            window.console.log('Error ====> '+error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error!!', 
                message: error.message, 
                variant: 'error'
            }),);
        });
    }

}