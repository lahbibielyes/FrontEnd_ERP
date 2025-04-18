import { Component,ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { BesoinsService } from '../services/besoins.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../services/contacts.service';
import { ProfileService } from '../services/profile.service';
import { HistoriqueBesoinsService } from '../services/historique-besoins.service';
import dayjs from 'dayjs';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-besoins',
  standalone: true,
  imports: [CommonModule,DragDropModule,ReactiveFormsModule],
  templateUrl: './besoins.component.html',
  styleUrl: './besoins.component.css'
})
export class BesoinsComponent implements OnInit{
  constructor(private AuthSer:AuthService,private hbs:HistoriqueBesoinsService,private ps:ProfileService,private contactsService: ContactsService ,private besoinsService:BesoinsService,private fb: FormBuilder,private profileService : ProfileService) { }
  status:any;
  selectedBesoin: any;
  isModalOpen: boolean = false;
  isAddModalOpen: boolean = false;
  isHistoricModalOpen: boolean = false;
  creationDate: any;
  nbBesoins: number = 0;

  contacts: any[] = [];
  historiqueDuBesoin: any[] = [];
  user: any 
  


  columns: { title: string, status: string, color:string, besoins: any[] }[] = [
    { title: 'À TRAITER', status: 'A_TRAITER', color: "#FFA500", besoins: [] },
    { title: 'ABANDONNÉ', status: 'ABANDONNÉ',color : "#000080", besoins: [] },
    { title: 'OK PRÉ-QUALIFIÉ', status: 'OK_PREQUALIFIE',color: "#00FFFF", besoins: [] },
    { title: 'EN COURS', status: 'EN_COURS',color: "#80FF00", besoins: [] },
    { title: 'GAGNÉ', status: 'GAGNÉ',color: "#0096AA", besoins: [] },
    { title: 'PERDU', status: 'PERDU',color: "#FA0000", besoins: [] },
    { title: 'REPORTÉ', status: 'REPORTE',color: "#FF80FF", besoins: [] }
  ];



  ngOnInit() {
    this.profileService.findUserById(Number(localStorage.getItem('id'))).subscribe(
      (user: any) => {
        this.user = user;
      })
    this.nbBesoins = 0;
    this.loadBesoins();
    this.loadContacts();
    

  }


  loadContacts() {
    this.contactsService.findAllContacts().subscribe(
      (contacts: any) => {
        this.contacts = contacts;
      },
      (error: any) => {
        console.error('Erreur lors du chargement des contacts:', error);
      });
    }
    

    loadContact(besoin: any) {
      //console.log('besoin:',besoin);
      this.contactsService.findContactById(besoin.contact).subscribe(
        (contact: any) => {
          besoin.contact = contact;
        },
        (error: any) => {
          console.error(`Erreur lors du chargement du contact ${besoin.contact}:`, error);
        }
      );
    }


    loadBesoins() {
      this.columns.forEach(column => {
        this.besoinsService.findBesoinByStatus(column.status).subscribe(
          (besoins: any) => {
            // Tri décroissant par date de création
            besoins.sort((a: any, b: any) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    
            column.besoins = besoins;
    
            besoins.forEach((element: any) => {
              if (parseInt(element.contact)) {
                this.loadContact(element);
              }
            });
    
            this.nbBesoins += besoins.length;
          },
          (error: any) => {
            console.error(`Erreur lors du chargement des besoins pour le statut ${column.status}:`, error);
          }
        );
      });
    }
    

  drop(event: CdkDragDrop<any[], any, any>, newStatus: string) {
    const previousContainer = event.previousContainer;
    const currentContainer = event.container;
  
    if (previousContainer === currentContainer) {
      moveItemInArray(currentContainer.data, event.previousIndex, event.currentIndex);
    } else {
      const movedItem = previousContainer.data[event.previousIndex];
  
      transferArrayItem(
        previousContainer.data,
        currentContainer.data,
        event.previousIndex,
        event.currentIndex
      );
      const contactId = movedItem.contact ? movedItem.contact.id : null;
      //console.log('contactId:', movedItem);
  
      movedItem.status = newStatus;
      movedItem.contact=this.contacts.find(contact => contact.id == contactId);
  
      //console.log('Besoin déplacé:', movedItem);
      //console.log('Nouveau statut:', newStatus);
      if(movedItem.status=='PERDU' || movedItem.status=='GAGNÉ' || movedItem.status=='REPORTE'){
        movedItem.priority='RIEN';
      }
      this.besoinsService.updateBesoin(movedItem.id,movedItem).subscribe(
        (response: any) => {
          console.log(`Besoin ${movedItem.id} mis à jour avec le statut ${newStatus}`);
          this.ngOnInit();

          const movedHistoricBesoin = {
            besoinId: movedItem.id,
            title: movedItem.title,
            description: "Changement de statut",
            actionDate: dayjs().toISOString(), // Format ISO 8601, par exemple "2025-04-09T15:30:06.000+01:00"
            status: movedItem.status,
            actionBy: this.user.id,
          };
          
          console.log('Historique besoin changé:', movedHistoricBesoin);
          this.hbs.addHistoriqueBesoin(movedHistoricBesoin).subscribe(
            (response: any) => {
              console.log('Statut d\'historique changé avec succès:', response);
            },
            (error: any) => {
              console.error('Erreur lors du changement du statut de l\'historique:', error);
            }
          );
        },
        (error: any) => {
          console.error(`Erreur lors de la mise à jour du besoin ${movedItem.id}`, error);
        }
      );
    }
  }

  besoinForm = this.fb.group({
    id: [{ value: 0 }, Validators.required],
    title: [{value:''},Validators.required],
    description: [{value:''},Validators.required],
    creationDate: [{value:''},Validators.required],
    status:['',Validators.required],
    contact:[''],
    createdBy:['',Validators.required],
    priority:['',Validators.required],
  });

  besoinAddForm = this.fb.group({
    title: [{value:''},Validators.required],
    description: [{value:''},Validators.required],
    creationDate: [{value:new Date().toLocaleDateString('fr-FR')}],
    status:[''],
    contact:[Validators.required],
    createdBy:[],
    priority:[{value:''},Validators.required],
  });
  
  
  userr!:any;
  
  fillForm(besoin: any) {
    if (!besoin) return;
    this.ps.findUserById(besoin.createdBy).subscribe(
      (user: any) => {
        this.userr = user;
        //console.log('User:', this.userr);
      })
    this.selectedBesoin = besoin;
    //console.log('besoin:',besoin);
    this.creationDate = new Date(besoin.creationDate).toLocaleDateString('fr-FR');
    //console.log('creationDate:',this.creationDate);
    this.besoinForm.patchValue({
      id: besoin.id,
      title: besoin.title,
      description: besoin.description,
      creationDate: this.creationDate,
      status:besoin.status,
      contact:besoin.contact.lastname+' '+besoin.contact.firstname,
      createdBy:this.user.firstname+' '+this.user.lastname,
      priority:besoin.priority
    });
}

addBesoin() {
  const formValue = this.besoinAddForm.value;

  // Assurez-vous que `contact` est un objet avec un `id`
  const contactId = formValue.contact;
  const contactObject = this.contacts.find(contact => contact.id == contactId);

  if (!contactObject) {
    console.error("Contact non valide !");
    return;
  }
//console.log('contactObject:',contactObject);
  const newBesoin = {
    title: formValue.title,
    description: formValue.description,
    creationDate: new Date().toISOString(), // Utilisation d'un format ISO valide
    status: "A_TRAITER",
    contact: contactObject, // Envoyer uniquement l'ID du contact
    createdBy:this.user.id,
    priority: formValue.priority
    
  };

  //console.log('Données envoyées:', newBesoin);

  this.besoinsService.addBesoin(newBesoin).subscribe(
    (response: any) => {
      console.log('Backend response:', response);
      this.ngOnInit();
      this.isAddModalOpen = false;
      console.log(newBesoin.creationDate);
      this.besoinsService
  .findBesoinByCreationDate(dayjs(newBesoin.creationDate).format('YYYY-MM-DD HH:mm:ss'))
  .subscribe(
    (besoin: any) => {
      console.log('Besoin récupéré:', besoin);
      const newHistoricBesoin = {
        besoinId: besoin.id,
        title: besoin.title,
        description: "Creation",
        actionDate: besoin.creationDate, // Format ISO initial ou à convertir si besoin
        status: "A_TRAITER",
        actionBy: this.user.id,
      };
      console.log('Historique besoin:', newHistoricBesoin);
      this.hbs.addHistoriqueBesoin(newHistoricBesoin).subscribe(
        (response: any) => {
          console.log('Historique ajouté avec succès:', response);
        },
        (error: any) => {
          console.error('Erreur lors de l\'ajout de l\'historique:', error);
        }
      );
    },
    (error: any) => {
      console.error('Erreur lors de la récupération du besoin:', error);
    }
  );
    },
    (error: any) => {
      console.error('erreur lors de l\'ajout de besoin:', error);
    }
  );
}


  

  openModal(besoin: any) {
    this.fillForm(besoin);
    //console.log('besoin:',besoin);
    this.isModalOpen = true;    
  }
  openAddModal() {
    console.log('openAddModal');
    this.besoinAddForm.reset();
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.besoinAddForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveChanges() {
  
    const updatedData = this.besoinForm.value;
    //console.log('updatedData:',updatedData);
    updatedData.contact = this.selectedBesoin.contact;
    updatedData.creationDate = this.selectedBesoin.creationDate;
    
    if(updatedData.status=='PERDU' || updatedData.status=='GAGNÉ' || updatedData.status=='REPORTE'){
      updatedData.priority='RIEN';
    }
    console.log('updatedData:',updatedData);
    updatedData.createdBy= this.userr.id;
    
    
    const id = Number(updatedData.id);
    this.besoinsService.updateBesoin(id, updatedData).subscribe(
      (response: any) => {
        this.ngOnInit();
        console.log(`Besoin ${updatedData.id} mis à jour`);
        this.closeModal();
        const movedHistoricBesoin = {
          besoinId: updatedData.id,
          title: updatedData.title,
          description: "Changement de statut",
          actionDate: dayjs().toISOString(), // Format ISO 8601, par exemple "2025-04-09T15:30:06.000+01:00"
          status: updatedData.status,
          actionBy: this.user.id,
        };
        
        console.log('Historique besoin changé:', movedHistoricBesoin);
        this.hbs.addHistoriqueBesoin(movedHistoricBesoin).subscribe(
          (response: any) => {
            console.log('Statut d\'historique changé avec succès:', response);
          },
          (error: any) => {
            console.error('Erreur lors du changement du statut de l\'historique:', error);
          }
        );
      },
      (error: any) => {
        console.error(`Erreur lors de la mise à jour du besoin ${updatedData.id}`, error);
      }
    );
  }

  getPriorityColor(priority: string): string {
   // console.log('priority:',priority);
    switch (priority) {
      case 'TRÉS_HAUTE':
        return '#e10303'; // rouge
      case 'HAUTE':
        return '#df7104'; // orange
      case 'MOYENNE':
        return '#eae40f'; // jaune
      case 'BASSE':
        return '#26cc05'; // vert
      default:
        return '#CCCCCC'; // gris par défaut
    }
  }

  getHistoricBesoin(besoin :any){
    this.hbs.findHistoriqueBesoinsById(besoin.id).subscribe(
      (historique: any) => {
        console.log('Historique:', historique);
        historique.sort((a: any, b: any) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());
        this.historiqueDuBesoin = historique;
        this.historiqueDuBesoin.forEach(element => {
          this.profileService.findUserById(element.actionBy).subscribe(
            (user: any) => {
              element.actionBy = user.firstname + ' ' + user.lastname;
            }
          );
          
        });
      },
      (error: any) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
      }
    );
    console.log('historiqueDuBesoin:',this.historiqueDuBesoin);
    this.isHistoricModalOpen = true;
  }
  
  closeHistoricModal() {
    this.isHistoricModalOpen = false;
  }

}
