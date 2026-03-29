# MyFinanceStats

**MyFinances** is a web application that enables users to manage their financial transactions and to get insights into their yearly, monthly, and daily expenses.

<img width="2486" height="1446" alt="image" src="https://github.com/user-attachments/assets/8b589db5-e049-4fed-91aa-d4c9f5a566bd" />

## Tech Stack
The application consists of a Angular 17 frontend and a C# ASP.NET 8 CORE Web API as backend including a SQL Express database

### Frontend
- **Angular 17**
- **Angular Material & CDK** – UI components
- **RxJS** – Reactive programming for state and data handling  
- **ECharts + ngx-echarts** – Interactive data visualization   

### Backend
- **C# / ASP.NET Core 8 Web API** – RESTful backend services
- **Layered Architecture** implementing the **CQRS** pattern with **MediatR** for decoupled, maintainable logic.
- **Entity Framework** – ORM for database interaction  
- **SQL Server Express** – Relational database

### Authentication & Security

- **ASP.NET Core Identity** for user management and password hashing  
- **JWT Authentication** (Access & Refresh Tokens)  
- Token-based session management with secure refresh flow  
- Protected API endpoints using authentication middleware


## Architecture


## Installation

### Requirements
1. Installation of

    - Git 
    - Node.js 18+
    - npm 9+
    - .NET SDK 8.0+
    - SQL Server
    - Microsoft SQL Server Management Studio 18+

2. Clone the repository
    ```bash
    https://github.com/LucasBxstx/Finances.git


### Set up Backend
1. Open the backend in preferably Visual Studio 2022 by opening the file 'FinancesBackend.sln'

2. Make sure that Microsoft SQL Server Management Studio works and create a new database for the project to run it locally

3. Open 'appsettings.Development.json' and adjust the database connection string
    ```bash
    {
        "ConnectionStrings": {
            "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=DeineDatenbank;Trusted_Connection=True;"
        }
    }

4. Run the backend by clicking on the 'RUN' button, using HTTPS

5. Swagger will automatically open and the backend is available on port 7139
    ```bash
    https://localhost:7139

### Set up Frontend
1. Open the frontend (folder: FinancesWebApp) in preferably VS Code

2. For the installation of Angular following command is needed:
    ```bash
    npm install -g @angular/cli@17

3. Install all required packages
    ```bash
    npm install

4. Open the terminal in the root folder of the frontend

5. Run the frontend on a local webserver
    ```bash 
    ng serve

6. Open a browser window and go to
    ```bash
    http://localhost:4200

Now the Application should run

## Usage
Users of MyFinances can create their own accounts and login to the app. The web application consists of two pages. The transactions page, where users can add their incomes and expenses, and the statistics page, wher users can see statistics of their financial data.

### Features
#### Elementary
    - Register (Create Account)
    - Login
    - Logout
    - Delete Account

#### Transaction Page
    - Add / Edit / Delete Transactions
    - Add / Edit / Delete Labels
    - View monthly Transactions (select year and month)
    - Import CSV file (from MyFinances app or Splitwise)

#### Statistics Page
    - View statistics of the transactions and their labels over the last years and months
    - Filtering for year and months
    - Export transactions as CSV file

## Contributing
Contributions only with prior agreement and by following these rules:

1. Fork the repository.
2. Create a new branch for your feature:
    ```bash
    git checkout -b "feature/[your-feature]"

3. Make your changes and commit them:
    ```bash
    git commit -m "[frontend/backend: your feature description]"

4. Push the branch to your fork:
    ```bash
    git push origin feature/[your-feature]
   
5. Open a Pull Request.


## Citation Hint
No citations please!

## License
This project is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license.
