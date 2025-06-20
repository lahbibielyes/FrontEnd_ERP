import { Component , ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdkDragDrop, CdkDragMove, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { KanbanCompService } from '../../../services/kanban-comp.service';


import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';

import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MatTableModule } from '@angular/material/table';
import { ToastModule } from 'primeng/toast';
import { CompServiceService } from '../../../services/comp-service.service';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';


import { ContactsService } from '../../../services/contacts.service';
import { Router, RouterModule } from '@angular/router';
import dayjs from 'dayjs';
@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, DragDropModule, HttpClientModule, RouterModule, FormsModule, ReactiveFormsModule, MatTableModule,
    CommonModule, MatIconModule,RouterModule,MatFormFieldModule, MatIcon,MatInputModule,
    ToastModule, PaginatorModule, TableModule, ButtonModule, CheckboxModule, TooltipModule, MatButtonToggleModule, MatButtonModule],
   
   
  templateUrl: './company.component.html',
  styleUrl: './company.component.css',
  providers: [KanbanCompService, CompServiceService, MessageService]  
})
export class CompanyComponent implements OnInit {
switchMode($event: MatButtonToggleChange) {

}
  mode: any;
  nbCompanies: number = 0;
  statut:any;
  selectedCompany: any;
  
  creationDate: any;
  companycontacts: any;
  userrole: any;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  
    scrollKanban(direction: 'left' | 'right'): void {
      const container = this.scrollContainer.nativeElement;
      const scrollAmount = 300; // Ajuste la valeur selon tes besoins
  
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  
    // Properties for scroll behavior
    private scrollThreshold = 50; // Distance from edge to trigger scroll
    private scrollStep = 15; // Scroll amount per event

   onDragMoved(event: CdkDragMove<any>): void {
      const container = this.scrollContainer.nativeElement;
      const containerRect = container.getBoundingClientRect();
      const pointerX = event.pointerPosition.x;
  
      if (pointerX < containerRect.left + this.scrollThreshold) {
        container.scrollLeft -= this.scrollStep;
      }
      else if (pointerX > containerRect.right - this.scrollThreshold) {
        container.scrollLeft += this.scrollStep;
      }
    }
  
  
    columns: { title: string, status: string, color:string, companies: any[] }[] = [
      { title: 'Prospect', status: 'Prospect',                                        color: "#FFA500", companies: [] },
      { title: 'Client', status: 'Client',                                            color : "#000080", companies: [] },
      { title: 'Client direct', status: 'Client direct',                              color: "#00FFFF", companies: [] },
      { title: 'Partenaire', status: 'Partenaire',                                    color: "#80FF00", companies: [] },
      { title: 'Piste', status: 'Piste',                                              color: "#0096AA", companies: [] },
      { title: 'Fournisseur', status: 'Fournisseur',                                  color: "#FA0000", companies: [] },
      { title: 'Archivé', status: 'Archivé',                                          color: "#FF80FF", companies: [] },
      { title: 'Intermédiaire de facturation', status: 'Intermédiaire de facturation',color: "brown", companies: [] },
      { title: 'Client via intermédiaire', status: 'Client via intermédiaire',        color: "gray", companies: [] },
    ];
    companyForm!: FormGroup;
  
  constructor(private companyService: CompServiceService, private fb: FormBuilder,
    private contactsService: ContactsService, 
   private messageService: MessageService,
          private router: Router,
          private dialog: MatDialog, ) {
             this.companyForm = this.fb.group({
                  name: ['', []],
                  status: ['', []],
                  effective: [1, []],
                  sector: [null, []],
                  provenance : [null, []],
                  precise : ['', []],
                  filiales : [null, []],
                  email : ['', []],
                  agency: ['', []],
                  phone: ['', []],
                  address: ['', []],
                  postalCode: ['', []],
                  city: ['', []],
                  country: ['', []],
                  informations: ['', []],
                  creationDate: ['', []],
                  createdBy: ['', []],
                });
           }

           isModalOpen: boolean = true;
  username!:string;
  role!:any;
  
  ngOnInit(): void {
    this.mode="kanban";
    
    // Retrieve user role from local storage
    const storedRole = localStorage.getItem('role');
    this.userrole = storedRole;

    this.nbCompanies = 0;
    this.loadCompanies();
    this.listPaginate();
    
    this.filterForm = this.fb.group({
      company: [''],
      contact: [''],
      dateExact: [''],
      startDate: [''],
      endDate: ['']
    });

  this.role=localStorage.getItem("role");
    this.username=localStorage.getItem("username")?.toUpperCase()|| "";
    if(localStorage.getItem("msg")=="false"){
      this.isModalOpen=true;
    }
    else
    this.isModalOpen=false;
      
  }

  closeModal() {
    this.isModalOpen = false;
    localStorage.setItem("msg","true");
  }
 
  openFilterDialog(){

  }
  loadCompanies() {
     // Debugging line
    this.columns.forEach(column => {
      this.companyService.findCompanyByStatus(column.status).subscribe(
        (response: any) => {
          column.companies = response;
          
           
          },
        (error: any) => {
          console.error(`Erreur lors du chargement des besoins pour le statut ${column.status}:`, error);
        }
      );
    });
    this.companyService.getComps().subscribe(
      (response: any) => {
        this.nbCompanies = response.length;
        //console.log('Nombre total de sociétés:', this.nbCompanies); 
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des sociétés:', error);
      }
    );
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
      this.companyForm.patchValue({
        name: movedItem.name,
        status: newStatus,
        effective: movedItem.effective,
        sector: movedItem.sector,
        provenance: movedItem.provenance,
        precise: movedItem.precise,
        filiales: movedItem.filiales,
        email: movedItem.email,
        agency: movedItem.agency,
        phone: movedItem.phone,
        address: movedItem.address,
        postalCode: movedItem.postalCode,
        city: movedItem.city,
        country: movedItem.country,
        informations: movedItem.informations,
        creationDate: movedItem.creationDate,
        createdBy: movedItem.createdBy
      });
  
      
      
  
      //console.log('societe déplacé11111111:', movedItem);
      //console.log('Nouveau statut:', newStatus);

      this.companyService.updateCompanystatus(movedItem.id,this.companyForm.value).subscribe(
        (response: any) => {
          //console.log(`societe ${movedItem.id} mis à jour avec le statuttttttttttttttttttttttttttttttttttttt ${newStatus}`);
          
          this.ngOnInit();
        },
        (error: any) => {
          console.error(`Erreur lors de la mise à jour le la societe ${movedItem.id}`, error);
        }
      );
      
    }
  }











  checked: any[] = [];
    columnName: string[] = ['check', 'Société', 'Secteur', 'Informations', 'État', 'Coordonnées', 'Lieu', 'Manager'];
    @Input()
    liste: any[] = [];
    interminate: boolean = false;
    allComplete: boolean = false;
    //dataSource = new MatTableDataSource<any>();
    dataSource: any[] = [];
    @Output()
    onClick = new EventEmitter<any>();

    @Output()
    refreshClick = new EventEmitter<any>();

    size: number = 10;
    page: number = 0;
    first: boolean = false;
    last: boolean = false;
    totalElements: number = 0;
    totalPages: number = 0;
    debouncedSearchValue: string = '';

    styleTable = 'p-datatable-sm'


    performSearch() {

    
    }
    
    listPaginate() {
      this.companyService.getComps().subscribe(
          (response: any) => {
              this.liste = response;
              this.dataSource = this.liste;
              //console.log('Liste des sociétés:', this.liste);
          },
          (error: any) => { console.error('Erreur lors de la récupération des sociétés:', error); }
      );  
          
    }
    
    
    
    
    
    viewSite(url:any) {
        if (url.includes('http') == false)
            url = 'https://' + url;
        url.replace('http://', 'https://')
        window.open(url, '_blank');
    }
    viewPhone(phone :any) {
        let link = `tel:${phone}`;
    
        window.location.href = link;
    }
    
    
    
    
    
    deleted() {/*
        const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '500px',
            data: {
                title: 'Voulez-vous supprimer?',
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result == true) this.deleteCompany();
            else return;
        });*/
    }
    
    paginate(event:any) {
        this.page = event.page;
        this.size = event.rows;
        this.totalPages = event.pageCount;
        this.listPaginate();
    }
    
    
    imageUrl(company:any) {/*
        return this.imageServ.getFile(company.pictureName);*/
    }
    editCompany(company: any) {
        this.router.navigate(['/addcomp', company.id]);
      }
      
      deleteCompany(company: any) {
        
        if (confirm('Voulez-vous vraiment supprimer cette société ?')) {
            //console.log('Suppression de la société:', company.id);
          this.companyService.deleteComp(company.id).subscribe(
            (response: any) => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Société supprimée avec succès' });
              this.listPaginate();
            },
            (error: any) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Échec de la suppression' });
            }
          );
        }
      }





      selectedFilterMethod: string = '';
          showFilterPanel: boolean = false;
          filterForm!:FormGroup;

      filterCompanies(): void {
          const { company,  dateExact, startDate, endDate } = this.filterForm.value;
          let filtered = this.liste;
          //console.log('filtered:', this.filterForm.value);

          if(this.selectedFilterMethod !="" && company=="" && dateExact=="" && startDate=="" && endDate=="") {
          this.ngOnInit()
          }
        
          if(this.selectedFilterMethod === 'company' && company && company.trim() !== '') {
        
            const searchLower = company.trim().toLowerCase();
            //console.log('searchLower:',searchLower);
            filtered = filtered.filter(company => {
              if (company.name) {
                //console.log('besoin.contact.company.name:',company.name);
                //console.log('searchLower:',searchLower);
                const companyName = (company.name || '').toLowerCase();
                return companyName.includes(searchLower);
              }
              return false;
            });
          }
        
          
        
          if (this.selectedFilterMethod === 'dateExact' && dateExact) {
            filtered = filtered.filter(company =>
              dayjs(company.creationDate).format('YYYY-MM-DD') === dayjs(dateExact).format('YYYY-MM-DD')
            );
          }
        
          if (this.selectedFilterMethod === 'dateRange') {
            if (startDate && endDate) {
              filtered = filtered.filter(company =>
                dayjs(company.creationDate).isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]')
              );
            } else if (startDate) {
              filtered = filtered.filter(company =>
                dayjs(company.creationDate).isSameOrAfter(dayjs(startDate), 'day')
              );
            } else if (endDate) {
              filtered = filtered.filter(company =>
                dayjs(company.creationDate).isSameOrBefore(dayjs(endDate), 'day')
              );
            }
          }
          this.liste = filtered;
        
        
          this.columns.forEach(column => {
            column.companies = filtered.filter(company => company.status === column.status);
          });
        
          
          this.nbCompanies = 0;
          this.columns.forEach(column => {
            
              this.nbCompanies += column.companies.length;
            
          });
        
          //console.log('Besoins filtrés :', filtered);
        }
        toggleFilterPanel() {
          this.showFilterPanel = !this.showFilterPanel;
          
          if (!this.showFilterPanel) {
            this.selectedFilterMethod = '';
            this.filterForm.reset();
            this.ngOnInit();
          }
        }
        

}
