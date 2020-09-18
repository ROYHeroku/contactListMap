public inherited sharing class contactListMapController {
     public contactListMapController() {

    }
    @AuraEnabled(Cacheable = true)
    public static List<Contact> getContacts(Integer pagenumber, Integer numberOfRecords, Integer pageSize, String searchString) {
       
     String searchKey = '%' + searchString + '%';  
     String query = 'select id, Name, FirstName,LastName, Phone, Email, MailingAddress,MailingCity,MailingCountry, MailingPostalCode,MailingState,MailingStreet from Contact ';  
     if (searchString != null && searchString != '') {  
       query += ' where name like \'%' + searchString + '%\' ';  
     }  
     query += ' limit ' + pageSize + ' offset ' + (pageSize * (pagenumber - 1));  
     return Database.query(query);  
            
    }
    
    @AuraEnabled(Cacheable = true)
    public static List<Contact> getContactsWire(Integer pagenumber, Integer pageSize, String searchString) {
       
     String searchKey = '%' + searchString + '%';  
     String query = 'select id, Name, FirstName,LastName, Phone, Email, MailingAddress,MailingCity,MailingCountry, MailingPostalCode,MailingState,MailingStreet from Contact ';  
     if (searchString != null && searchString != '') {  
       query += ' where name like \'%' + searchString + '%\' ';  
     }  
     query += ' limit ' + pageSize + ' offset ' + (pageSize * (pagenumber - 1));  
     return Database.query(query);  
   }
    @AuraEnabled
    public static void deleteContacts(list<Id> lstConIds){
        try {
            list<Contact> lstConsToDelete = new list<Contact>();
            System.debug('lstConIds ====> '+lstConIds);
            for(Id idCon : lstConIds) {
                lstConsToDelete.add(new Contact(Id = idCon));
            }
            if(!lstConsToDelete.isEmpty()) {
                delete lstConsToDelete;
            }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    @AuraEnabled(cacheable = true)  
   public static Integer getContacsCount(String searchString) {  
     String query = 'select count() from Contact ';  
     if (searchString != null && searchString != '') {  
       query += ' where name like \'%' + searchString + '%\' ';  
     }  
     return Database.countQuery(query);  
   }  
}