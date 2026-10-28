export interface KotlinSnippet {
  filename: string;
  category: string;
  code: string;
  description: string;
}

export const KOTLIN_COMPOSE_SNIPPETS: KotlinSnippet[] = [
  {
    filename: 'HomeScreen.kt',
    category: 'Jetpack Compose UI',
    description: 'Jetpack Compose Material 3 Home Dashboard screen with sales KPIs, quick actions, and recent receipts.',
    code: `package com.invoicy.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.invoicy.app.ui.components.ReceiptCard
import com.invoicy.app.ui.components.SalesKpiCard
import com.invoicy.app.viewmodel.InvoicyViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: InvoicyViewModel,
    onNavigateToCreateReceipt: () -> Unit,
    onNavigateToCustomers: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onSelectReceipt: (String) -> Unit
) {
    val uiState by viewModel.dashboardState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Invoicy",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = uiState.businessName,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateToCreateReceipt) {
                        Icon(Icons.Default.Add, contentDescription = "New Receipt")
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNavigateToCreateReceipt,
                icon = { Icon(Icons.Default.Receipt, contentDescription = null) },
                text = { Text("New Receipt") },
                containerColor = MaterialTheme.colorScheme.primary
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Today's Sales Metrics
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    SalesKpiCard(
                        modifier = Modifier.weight(1f),
                        title = "Today's Sales",
                        value = uiState.todaySalesFormatted,
                        subtitle = "\${uiState.todayOrdersCount} orders",
                        isHighlight = true
                    )
                    SalesKpiCard(
                        modifier = Modifier.weight(1f),
                        title = "Unpaid Balance",
                        value = uiState.unpaidBalanceFormatted,
                        subtitle = "Needs follow up",
                        isHighlight = false
                    )
                }
            }

            // Quick Actions Strip
            item {
                Text(
                    text = "Quick Actions",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilledTonalButton(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToCreateReceipt
                    ) {
                        Icon(Icons.Default.AddCircleOutline, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("New Receipt")
                    }
                    OutlinedButton(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToCustomers
                    ) {
                        Icon(Icons.Default.People, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Customers")
                    }
                    OutlinedButton(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToOrders
                    ) {
                        Icon(Icons.Default.ListAlt, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("All Orders")
                    }
                }
            }

            // Recent Receipts
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Recent Receipts",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    TextButton(onClick = onNavigateToOrders) {
                        Text("View All")
                    }
                }
            }

            items(uiState.recentReceipts) { receipt ->
                ReceiptCard(
                    receipt = receipt,
                    onClick = { onSelectReceipt(receipt.id) }
                )
            }
        }
    }
}`,
  },
  {
    filename: 'ReceiptEntity.kt',
    category: 'Room Database & Entities',
    description: 'Room Entities for Receipt and Customer with Room TypeConverters for item lists and payment status.',
    code: `package com.invoicy.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.invoicy.app.data.local.converters.ReceiptConverters

enum class PaymentStatus { PAID, UNPAID, PARTIAL }
enum class PaymentMethod { CASH, CARD, BANK_TRANSFER, MOBILE_PAYMENT, POS, OTHER }

data class LineItem(
    val id: String,
    val name: String,
    val quantity: Double,
    val unitPrice: Double,
    val total: Double
)

@Entity(tableName = "receipts")
@TypeConverters(ReceiptConverters::class)
data class ReceiptEntity(
    @PrimaryKey
    val id: String,
    val receiptNumber: String,
    val customerId: String,
    val customerName: String,
    val customerPhone: String?,
    val customerEmail: String?,
    val customerAddress: String?,
    val createdAt: Long = System.currentTimeMillis(),
    val dueDate: Long?,
    val items: List<LineItem>,
    val subtotal: Double,
    val taxRate: Double,
    val taxAmount: Double,
    val discountType: String,
    val discountValue: Double,
    val discountAmount: Double,
    val grandTotal: Double,
    val amountPaid: Double,
    val balanceDue: Double,
    val paymentStatus: PaymentStatus,
    val paymentMethod: PaymentMethod,
    val notes: String?
)

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val phone: String,
    val email: String,
    val address: String,
    val taxNumber: String?,
    val notes: String?,
    val createdAt: Long = System.currentTimeMillis()
)`,
  },
  {
    filename: 'ReceiptDao.kt',
    category: 'Room Database & Entities',
    description: 'Room Data Access Object (DAO) with reactive Kotlin Flow queries for offline persistence.',
    code: `package com.invoicy.app.data.local.dao

import androidx.room.*
import com.invoicy.app.data.local.entity.CustomerEntity
import com.invoicy.app.data.local.entity.ReceiptEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ReceiptDao {
    @Query("SELECT * FROM receipts ORDER BY createdAt DESC")
    fun getAllReceiptsFlow(): Flow<List<ReceiptEntity>>

    @Query("SELECT * FROM receipts WHERE createdAt >= :startOfDay ORDER BY createdAt DESC")
    fun getTodayReceiptsFlow(startOfDay: Long): Flow<List<ReceiptEntity>>

    @Query("SELECT * FROM receipts WHERE customerId = :customerId ORDER BY createdAt DESC")
    fun getReceiptsByCustomer(customerId: String): Flow<List<ReceiptEntity>>

    @Query("SELECT * FROM receipts WHERE id = :id LIMIT 1")
    suspend fun getReceiptById(id: String): ReceiptEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReceipt(receipt: ReceiptEntity)

    @Update
    suspend fun updateReceipt(receipt: ReceiptEntity)

    @Delete
    suspend fun deleteReceipt(receipt: ReceiptEntity)
}

@Dao
interface CustomerDao {
    @Query("SELECT * FROM customers ORDER BY name ASC")
    fun getAllCustomersFlow(): Flow<List<CustomerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    @Delete
    suspend fun deleteCustomer(customer: CustomerEntity)
}`,
  },
  {
    filename: 'InvoicyViewModel.kt',
    category: 'Architecture & StateFlow',
    description: 'Android ViewModel managing receipt creation state, automatic calculations, and Room repository operations.',
    code: `package com.invoicy.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.invoicy.app.data.local.entity.LineItem
import com.invoicy.app.data.local.entity.PaymentStatus
import com.invoicy.app.data.local.entity.ReceiptEntity
import com.invoicy.app.data.repository.InvoicyRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

class InvoicyViewModel(
    private val repository: InvoicyRepository
) : ViewModel() {

    val receipts = repository.allReceipts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val customers = repository.allCustomers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Real-time calculation helper
    fun calculateTotals(
        items: List<LineItem>,
        taxRate: Double,
        discountPercentage: Double
    ): ReceiptTotals {
        val subtotal = items.sumOf { it.total }
        val discountAmount = subtotal * (discountPercentage / 100.0)
        val discountedSubtotal = subtotal - discountAmount
        val taxAmount = discountedSubtotal * (taxRate / 100.0)
        val grandTotal = discountedSubtotal + taxAmount
        return ReceiptTotals(subtotal, discountAmount, taxAmount, grandTotal)
    }

    fun saveReceipt(receipt: ReceiptEntity) {
        viewModelScope.launch {
            repository.insertReceipt(receipt)
        }
    }
}

data class ReceiptTotals(
    val subtotal: Double,
    val discountAmount: Double,
    val taxAmount: Double,
    val grandTotal: Double
)`,
  },
];
