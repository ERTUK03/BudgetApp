using BudgetApp.Models;
using BudgetApp.Services;

namespace BudgetApp.Pages;

// ViewModel item for the CollectionView
public class TransactionItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string CategoryDisplay { get; set; } = "";
    public string AmountDisplay { get; set; } = "";
    public string AmountColor { get; set; } = "#e2eaf4";
    public string DateDisplay { get; set; } = "";
}

public partial class DashboardPage : ContentPage
{
    private readonly AuthService _auth;
    private readonly ApiService _api;
    private readonly LocalDbService _localDb;

    private int _month = DateTime.Now.Month;
    private int _year = DateTime.Now.Year;

    public DashboardPage(AuthService auth, ApiService api, LocalDbService localDb)
    {
        InitializeComponent();
        _auth = auth;
        _api = api;
        _localDb = localDb;
        SetupPickers();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        WelcomeLabel.Text = $"Cześć, {_auth.CurrentUser?.Username ?? ""}!";
        await LoadDataAsync();
        _ = SyncPendingAsync(); // background sync
    }

    private void SetupPickers()
    {
        string[] months = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
                           "Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
        foreach (var m in months) MonthPicker.Items.Add(m);
        MonthPicker.SelectedIndex = _month - 1;

        for (int y = 2023; y <= 2027; y++) YearPicker.Items.Add(y.ToString());
        YearPicker.SelectedIndex = YearPicker.Items.IndexOf(_year.ToString());
    }

    private async Task LoadDataAsync()
    {
        bool isOnline = true;
        MonthlySummaryDto? summary = null;
        List<TransactionDto> txList = new();

        try
        {
            summary = await _api.GetSummaryAsync(_auth.Token!, _month, _year);
            var txData = await _api.GetTransactionsAsync(_auth.Token!, month: _month, year: _year);
            txList = txData?.Items ?? new();
            await _localDb.CacheTransactionsAsync(txList);
        }
        catch
        {
            isOnline = false;
            var cached = await _localDb.GetCachedTransactionsAsync();
            txList = cached.Select(c => new TransactionDto
            {
                Id = c.RemoteId,
                Title = c.Title,
                Amount = c.Amount,
                Type = c.Type,
                Date = c.Date,
                Note = c.Note,
                Category = new CategoryDto { Name = c.CategoryName, Icon = c.CategoryIcon },
            }).ToList();
        }

        OfflineBanner.IsVisible = !isOnline;

        if (summary is not null)
        {
            IncomeLabel.Text = FormatPln(summary.TotalIncome);
            ExpenseLabel.Text = FormatPln(summary.TotalExpense);
            BalanceLabel.Text = FormatPln(summary.Balance);
            BalanceLabel.TextColor = summary.Balance >= 0 ? Color.FromArgb("#60a5fa") : Color.FromArgb("#ef4444");
        }

        TxCountLabel.Text = txList.Count.ToString();

        RecentList.ItemsSource = txList.Take(10).Select(t => new TransactionItem
        {
            Id = t.Id,
            Title = t.Title,
            CategoryDisplay = t.Category is not null ? $"{t.Category.Icon} {t.Category.Name}" : "Brak kategorii",
            AmountDisplay = (t.Type == "income" ? "+" : "-") + FormatPln(t.Amount),
            AmountColor = t.Type == "income" ? "#22c55e" : "#ef4444",
            DateDisplay = t.Date.ToString("dd.MM.yyyy"),
        }).ToList();
    }

    private async Task SyncPendingAsync()
    {
        var pending = await _localDb.GetPendingAsync();
        foreach (var p in pending)
        {
            try
            {
                var created = await _api.CreateTransactionAsync(_auth.Token!, new TransactionCreateDto
                {
                    Title = p.Title, Amount = p.Amount, Type = p.Type,
                    Note = p.Note, Date = p.Date, CategoryId = p.CategoryId,
                });
                if (created is not null) await _localDb.MarkSyncedAsync(p.LocalId);
            }
            catch { break; }
        }
    }

    private async void OnRefresh(object sender, EventArgs e)
    {
        await LoadDataAsync();
        RefreshView.IsRefreshing = false;
    }

    private void OnPeriodChanged(object sender, EventArgs e)
    {
        _month = MonthPicker.SelectedIndex + 1;
        if (int.TryParse(YearPicker.SelectedItem?.ToString(), out int y)) _year = y;
        _ = LoadDataAsync();
    }

    private async void OnGoTransactions(object sender, EventArgs e)
        => await Shell.Current.GoToAsync(nameof(TransactionsPage));

    private async void OnAddTransaction(object sender, EventArgs e)
        => await Shell.Current.GoToAsync(nameof(AddTransactionPage));

    private static string FormatPln(decimal amount)
        => amount.ToString("N2", new System.Globalization.CultureInfo("pl-PL")) + " zł";
}
