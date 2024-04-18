import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { TransactionsPageComponent } from './transactions/transactions-page.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AuthGuardService } from './shared/services/authGuardService';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'create-account',
        component: CreateAccountComponent
    },
    {
        path: 'transactions',
        component: TransactionsPageComponent,
        canActivate: [AuthGuardService]
    },
    {
        path: 'statistics',
        component: StatisticsComponent,
        canActivate: [AuthGuardService]
    }
];
